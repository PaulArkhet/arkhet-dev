import { mightFail, mightFailSync } from 'might-fail';
import { sleep } from '../langgraph';
import {
  notificationItemSchema,
  partialNotificationItemSchema,
} from '../../interfaces/ws';

import { z } from 'zod';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import type { ShapeVariations } from '../../interfaces/artboard';
import type { StyleguideWithJoins } from '../../services/styleguide.service';
import {
  codeModelToString,
  humanMessageWithImage,
  type CodeModel,
} from '../langgraph';
import { verifyCode } from '../tools/filesystemTools';
import { arkhetGeneralInfo } from '../agents/generator/prompts';
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import type { Socket } from 'socket.io';
import type { PostScreenshotMessage } from '../../interfaces/ws';
import {
  createNewFunctionToolSchema,
  deleteFunctionToolSchema,
  generateTools,
  updateToolSchema,
} from './actions';
import { getLiveReactScreenshotMessage } from '../agents/generator/actor';
import type { GenParams } from '../../controllers/ai';
import {
  qStar,
  type CandidateGenerator,
  type MDPState,
  type RewardFunction,
  type TerminalCheck,
} from './main';

type Wireframe = {
  id: string;
  base64String: string;
  title: string;
  description: string;
  connections: { fromShape: ShapeVariations; toPageId: string }[];
};

export type Task = {
  pageScreenshot: { message: PostScreenshotMessage | null };
  wireframes: Wireframe[];
  styleguide: StyleguideWithJoins;
  model: CodeModel;
  socket: Socket;
  currentWireframeId: string;
};

type Think = { type: 'think'; content: string };
type ChangeFocusedWireframe = {
  type: 'changeFocusedWireframe';
  content: string;
};
type DeleteFunction = {
  type: 'deleteFunction';
  content: z.infer<typeof deleteFunctionToolSchema>;
};
type CreateFunction = {
  type: 'createFunction';
  content: z.infer<typeof createNewFunctionToolSchema>;
}; // can terminate
type UpdateFunction = {
  type: 'updateFunction';
  content: z.infer<typeof updateToolSchema>;
}; // can terminate
type SubmitForReview = { type: 'submitForReview'; content: string }; // can terminate

type LLMAction =
  | Think
  | SubmitForReview
  | ChangeFocusedWireframe
  | DeleteFunction
  | CreateFunction
  | UpdateFunction;

type IntermediateStep = {
  action: LLMAction['type'];
  result: string;
  updatedCode: CodeModel; // action applied to this
  reward: number;
};

const checkFinal: TerminalCheck<Task, IntermediateStep> = (state) => {
  const lastStep = state.reasoning.at(-1);
  if (!lastStep) return false;
  if (lastStep.action !== 'submitForReview') return false;

  const codeString = codeModelToString(lastStep.updatedCode);
  const error = verifyCode(codeString);

  if (error) return false;

  if (lastStep.reward < 0) return false;
  return true;
};

const reviewerLLM = new BedrockChat({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 1,
});

const rewardFunction: RewardFunction<Task, IntermediateStep> = async (
  state
) => {
  // here we evaluate the action. We can give a rating out of 0-1 to this step from an LLM
  const reviewPrompt = ChatPromptTemplate.fromMessages([
    'system',
    `
    ${arkhetGeneralInfo}

    <arkhet_reviewer>

      - you are arkhet-reviewer
      - your task is to review an action taken by arkhet.
      - arkhet's final goal is to build a fully functional react based prototype based on the given project details and wireframes.

      - possible actions are:
        * Think - Evaluate how well the plan or thinking step will lead us to a completed react project.
        * SubmitForReview - Evaluate the submission; should we have submitted the code as complete at this time? Completness involves ALL pages, so code submitted missing a page's implementation is completly incorrect.
        * ChangeFocusedWireframe - Should we be looking at a different wireframe? If we were just building something and it's not complete, this is a bad move, but if we're done, we should move on to something else in the project.
        * DeleteFunction - Should we be deleting this function? Is there any purpose in doing so, or did we lose progress? 
        * CreateFunction - Why are we creating this function? Was there any planning beforehand? 
        * UpdateFunction - Did we just make an update that makes sense and progresses us towards the final goal?
        * Create/Delete/Update a type

      - you are to reply with a rating from -10 to 10 with decimal numbers being allowed, so 9.7, 2.3, 4.4, 0, 10, 10.0, -10, -9.2, -3 are all okay.
      - Your rating reflects how well the current action aligns with the final goal.
      - 11, 10.005, -10.005 are NOT okay responses.
      - you are to reply with: a number and a justification. Reply in json format with two fields: rating: number, justification: string
      - reply only with JSON, no other information. Your response must be valid parseable JSON.

    </arkhet_reviewer>
  `,
    new MessagesPlaceholder('messages'),
  ]);

  const outputFormat = z.object({
    rating: z.number(),
    justification: z.string(),
  });

  const reviewModel = reviewPrompt.pipe(
    reviewerLLM.withStructuredOutput(outputFormat)
  );
  console.log('Review Agent: Invoking review model...');

  const lastAction = state.reasoning.at(-1);
  const code = {
    ...(lastAction ? lastAction.updatedCode : state.initial.model),
  };
  // Exponential backoff parameters.
  const maxRetries = 10;
  const baseDelay = 1000; // in milliseconds
  let response: any;
  let attempt = 0;

  const currentWireframe = state.initial.wireframes.find(
    (pageStruct) => pageStruct.id == state.initial.currentWireframeId
  )?.base64String;

  if (!currentWireframe) {
    throw new Error(
      `currentPageId: ${state.initial.currentWireframeId} does not exist in pageStructure`
    );
  }
  const context = [
    humanMessageWithImage(
      currentWireframe,
      `wireframe of the currently selected page path: ${state.initial.currentWireframeId}`
    ),
    getLiveReactScreenshotMessage(state.initial.pageScreenshot.message),
    new HumanMessage({
      content: `You're given the following styleguide colors to follow:
              Primary Color: ${state.initial.styleguide.primaryColor}
              Secondary Colors: ${state.initial.styleguide.secondaryColorStyles.firstColor}, ${state.initial.styleguide.secondaryColorStyles.secondColor}
              Neutral Colors: ${state.initial.styleguide.neutralColorStyles.firstColor}, ${state.initial.styleguide.neutralColorStyles.secondColor}, ${state.initial.styleguide.neutralColorStyles.thirdColor}
            `,
    }),
    new HumanMessage(
      `Here are all the wireframes with images ommited for conciseness: 
          ${JSON.stringify(
        state.initial.wireframes.map((wireframe) => ({
          id: wireframe.id,
          title: wireframe.title,
          descripton: wireframe.description,
          connections: wireframe.connections,
        }))
      )}`
    ),
    new HumanMessage({
      content: `Current code: ${codeModelToString(code)}`,
    }),
  ];

  while (attempt <= maxRetries) {
    try {
      const reviewMessages = new HumanMessage(
        `Previous Last 10 (or less) actions, first ones are most recent: ${JSON.stringify(
          state.reasoning
            .slice(state.reasoning.length > 10 ? -10 : -state.reasoning.length)
            .toReversed(),
          null,
          2
        )}`
      );
      console.log(
        `Passing data about action ${state.reasoning.at(-1)?.action}`
      );
      response = await reviewModel.invoke({
        messages: [...context, reviewMessages],
      });
      break; // Success, break out of retry loop.
    } catch (error) {
      if ((error as any).toString().includes('Too many tokens')) {
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          console.warn(
            `Review Agent: Attempt ${attempt + 1} failed with "Too many tokens". Retrying in ${delay} ms.`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          attempt++;
        } else {
          console.error(
            `Review Agent: Exceeded maximum retries due to "Too many tokens" error.`
          );
          throw error;
        }
      } else {
        console.warn(
          'Review agent failed with error, setting utility to 0...',
          error
        );
        return 0; // review agent failed, return 0 for now
      }
    }
  }

  console.log('Review Agent: Received response:', response);
  const { rating } = response;
  console.log('Review Agent: Extracted rating:', rating);
  const normalizedRating = rating === 0 ? 0 : rating / 10;

  state.reasoning.at(-1)!.reward = normalizedRating;

  return normalizedRating;
};

const actorLLM = new BedrockChat({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 1,
});

const candidateGenerator: CandidateGenerator<Task, IntermediateStep> = async (
  state
) => {
  console.log('Candidate Generation: Starting candidate generation');
  const lastAction = state.reasoning.at(-1);
  const code = {
    ...(lastAction ? lastAction.updatedCode : state.initial.model),
  };

  const actorPrompt = ChatPromptTemplate.fromMessages([
    'system',
    `
    ${arkhetGeneralInfo}

    <arkhet-actor>

    - You are arkhet-actor, an extremely advanced AI programmer.

     <arkhet_actor_info>
       - You are arkhet-actor, an extremely advanced AI programmer.
      
       - arkhet-actor NEVER responds with just text, always use a tool.
       - arkhet-actor operates on a single tsx react file as the entire project it works on
       - All functions in this file are considered their own "section" of code.
       - arkhet-actor has access to tools to edit, create or delete functions.
       - arkhet-actor passes in the exact name of the function to modify, edit, delete its contents.
       - arkhet-actor will use functions to create all react components.
       - arkhet-actor will use functions to create reusable sections of code that are shared across the project.
       - arkhet-actor will ALWAYS use the (props: {{ foo: bar }}) syntax for react component functions.
       - arkhet-actor will NEVER use the ({{ foo }}: {{ foo: bar }}) syntax for react component functions.
       - arkhet-actor will NEVER use const \`functionName = () => {{}}\` syntax for its top level functions.
       - arkhet-actor will ALWAYS use \`function functionName() {{}} \` syntax for its top level functions.
       - arkhet-actor will ALWAYS use PascalCase for functions that do return JSX, known as Component.
       - arkhet-actor will ALWAYS use camelCase for any other functions.
       - arkhet-actor can use \`functionName = () => {{}}\` syntax for any functions not in global scope.
       - arkhet-actor will NEVER include lines of code outside of the function definition when creating or updating functions.
       - arkhet-actor will NEVER include a new call to ReactDOM.render.
       - arkhet-actor will ALWAYS stop using tools and give an explanation of what it did if the plan seems to have been completed.
       - arkhet-actor will NEVER use placeholder image text and will ALWAYS fill images with actual links to images, even if they're sample images.
       - arkhet-actor will NEVER implement pages that aren't included in the plan. Follow the plan and the plan only.
       - if there is only one page, don't make the layout component.

       - arkhet will use NEVER implement a page without looking at it, this means changing the focused wireframe using the changeFocusedWireframe tool and then implementing that page.

       - arkhet-actor will change the default shown page in the <Layout /> in order to see what they're working on. For example, when tackling page B, we should make that the default shown page and change it back when we are done.
       - the rendered react app screenshot given to you will always be showing the default page in this layout.

       - arkhet-actor will prioritise getting code without ESLint reference errors when possible.
        - this means creating stubs for undefined components as a priority. Reference errors are okay only temporarily.
       - arkhet-actor ALWAYS pays special attention the the <App /> component; this is the entry point into the application and must be updated before generation can finish.

       - arkhet-actor ALWAYS reasons 1-3 times through the reason tool before implementing any code.
       - arkhet-actor will write it's next reasoining step based on the original one.
       
       Example component:
       \`\`\`jsx

        function Example(props: {{ foo: bar }}) {{
          return (
            <div>
              <Foo />
              <Bar />
            </div>
          )
        }}

       \`\`\`

   </arkhet_actor_info>
    </arkhet-actor>
    `,
    new MessagesPlaceholder('messages'),
  ]);

  const currentWireframe = state.initial.wireframes.find(
    (pageStruct) => pageStruct.id == state.initial.currentWireframeId
  )?.base64String;
  if (!currentWireframe) {
    throw new Error(
      `currentPageId: ${state.initial.currentWireframeId} does not exist in pageStructure`
    );
  }
  const reviewMessages = new HumanMessage(
    `Previous Last 10 (or less) actions, first ones are most recent: ${JSON.stringify(
      state.reasoning
        .slice(state.reasoning.length > 10 ? -10 : -state.reasoning.length)
        .toReversed(),
      null,
      2
    )}`
  );

  const context = [
    humanMessageWithImage(
      currentWireframe,
      `wireframe of the currently selected page path: ${state.initial.currentWireframeId}`
    ),
    getLiveReactScreenshotMessage(state.initial.pageScreenshot.message),
    new HumanMessage({
      content: `You're given the following styleguide colors to follow:
              Primary Color: ${state.initial.styleguide.primaryColor}
              Secondary Colors: ${state.initial.styleguide.secondaryColorStyles.firstColor}, ${state.initial.styleguide.secondaryColorStyles.secondColor}
              Neutral Colors: ${state.initial.styleguide.neutralColorStyles.firstColor}, ${state.initial.styleguide.neutralColorStyles.secondColor}, ${state.initial.styleguide.neutralColorStyles.thirdColor}
            `,
    }),
    new HumanMessage(
      `Here are all the wireframes with images ommited for conciseness: 
          ${JSON.stringify(
        state.initial.wireframes.map((wireframe) => ({
          id: wireframe.id,
          title: wireframe.title,
          descripton: wireframe.description,
          connections: wireframe.connections,
        }))
      )}`
    ),
    new HumanMessage({
      content: `Current code: ${codeModelToString(code)}`,
    }),
    reviewMessages,
  ];

  const tools = generateTools({ ...state.initial, model: code });
  const actor = actorPrompt.pipe(
    actorLLM.bindTools(tools, { tool_choice: 'any' })
  );

  // Exponential backoff parameters.
  const maxRetries = 10;
  const baseDelay = 1000; // in milliseconds
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      console.log('Calling agent...');
      const response: AIMessage = await actor.invoke({
        messages: context,
      });

      if (!response.tool_calls || response.tool_calls.length === 0) {
        throw new Error('No tool calls in response');
      }
      const toolCall = response.tool_calls[0]!;
      const chosenTool = tools.find((tool) => tool.name === toolCall.name)!;
      const final = await chosenTool.invoke(toolCall);

      const content =
        final.content[0] !== '{' ? final.content : JSON.parse(final.content);

      let preReward;
      if (content.model) {
        preReward = {
          initial: { ...state.initial, model: final.model },
          reasoning: [
            ...state.reasoning,
            {
              action: chosenTool.name as LLMAction['type'],
              result: content.msg,
              updatedCode: content.model,
              reward: 0,
            },
          ],
        };
      } else {
        preReward = {
          initial: { ...state.initial, model: code },
          reasoning: [
            ...state.reasoning,
            {
              action: chosenTool.name as LLMAction['type'],
              result: content,
              updatedCode: code,
              reward: 0,
            },
          ],
        };
      }

      const reward = await rewardFunction(preReward);
      preReward.reasoning.at(-1)!.reward = reward;

      return preReward;
    } catch (error) {
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        attempt++;
      } else {
        console.error(`Candidate Generation: Exceeded maximum retries.`);
        throw error;
      }
    }
  }
  throw new Error();
};

const prompt = ChatPromptTemplate.fromMessages([
  'system',
  `
   <arkhet_communicator_info>
      - arkhet-communicator is an advanced communication agent designed to give users real time feedback on generation.
      - arkhet-communicator ALWAYS simplifies it's messaging by not using techinical jargon.
      - arkhet-communicator focuses on concise, updates as a continuation of previous events giving a concise update to a continous story.
      - arkhet-communicator responds in this json format with no other text: (/ stands for json brackets here): / title: string, body: string /
      - arkhet-communicator NEVER says "thank you" or "here's the updated status" or any other messages like this, ONLY the response JSON is given!
      - arkhet-communicator understands that users will not know about the planner, observer, actor or any other agents.
      - arkhet-communicator understands that users do not know what the words "React" mean.
      - arkhet-communicator makes no assumptions that users have any technical knowledge.
      - arkhet-communicator NEVER speaks directly to the user with "I" or "I'm ready to help". You run a notification system ONLY!
      - arkhet-communicator NEVER starts it's messages with anything other than an opening json bracket.
      - arkhet-communicator NEVER uses any special characters in it's body or title sections.
      - arkhet-communicator ALWAYS uses plain english in its body or title, without any code examples.
      - arkhet-communicator ALWAYS keeps its responses concise.
      - arkhet-communicator understands that if there are no components shown in a page, that means there's simply no navigational components. Avoid using the term "blank page" in these situations.

      - arkhet-communicator ALWAYS avoids saying things like "Code Error" or "System is stuck" as this may confuse the user and make them concerned.
      - arkhet-communicator ALWAYS describes what the system is doing in the context of positive change, avoiding negative language.

      
      <invalid_response_example> # remembering the / stands for a json bracket here...

        I understand my role as arkhet-communicator and will provide real-time feedback on generation in the specified JSON format, without using technical jargon or making assumptions about user knowledge. I'll focus on concise updates about what just happened, avoiding any direct communication or unnecessary phrasing. Here's an initial status update:
        /"title": "System Initialized", "body": "The Arkhet team is ready to begin creating your new app."/

      </invalid_response_example>

      <valid_response_example> # remembering the / stands for a json bracket here...

        /"title": "System Initialized", "body": "The Arkhet team is ready to begin creating your new app."/

      </valid_response_example>

      - arkhet-communicator NEVER outputs code in it's response!!!

    </arkhet_communicator_info>
  `,
  new MessagesPlaceholder('messages'),
]);

const communicatorLLM = new BedrockChat({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 0.1,
});

export const communicateToFrontend = async (
  state: MDPState<Task, IntermediateStep>
) => {
  const communicatorRecutionChain = prompt.pipe(communicatorLLM);

  let numFails = 0;

  const reviewMessages = new HumanMessage(
    `Previous Last 10 (or less) actions, first ones are most recent: ${JSON.stringify(
      state.reasoning
        .slice(state.reasoning.length > 10 ? -10 : -state.reasoning.length)
        .toReversed(),
      null,
      2
    )}`
  );

  while (true) {
    const { error: genError, result: response } = await mightFail(
      communicatorRecutionChain.invoke({
        messages: [
          reviewMessages,
          new HumanMessage(
            `Here are all the wireframes with images ommited for conciseness: 
          ${JSON.stringify(
              state.initial.wireframes.map((wireframe) => ({
                id: wireframe.id,
                title: wireframe.title,
                descripton: wireframe.description,
                connections: wireframe.connections,
              }))
            )}`
          ),
          new HumanMessage(
            `A reminder: Your role is NEVER to solve issues or output code. Follow your system prompt and respond ONLY with the json for the notification you are creating.`
          ),
        ],
      })
    );

    if (genError) {
      numFails++;
      if (numFails === 8) {
        throw new Error('Maximum retry limit hit.');
      }
      console.error(genError);
      await sleep(Math.pow(numFails, 2) * 2000 - 1000);
      continue;
    }

    try {
      // console.log('communicator res:', response);
      const parsed = mightFailSync(() =>
        JSON.parse(response.content as string)
      );
      if (parsed.error) {
        console.error('Error: ', parsed.error);
        break;
      }
      const { result, error } = await mightFail(
        partialNotificationItemSchema.parseAsync(parsed.result)
      );

      if (error) {
        console.error('Error: ', error, 'result: ', result);
        break;
      }

      // console.log('parsed notif:', result);

      state.initial.socket.emit('notification', {
        ...result,
        id: Math.floor(Math.random() * 9999999),
      } as z.infer<typeof notificationItemSchema>);
      return;
    } catch (error) {
      console.error('Error: ', error);
      break;
    }
  }
};

function aggregator(state: MDPState<Task, IntermediateStep>) {
  if (state.reasoning.length === 0) return 0;
  return (
    state.reasoning.reduce((acc, item) => {
      acc += item.reward;
      return acc;
    }, 0) / state.reasoning.length // average reward
  );
}

export async function runQStarGeneration(socket: Socket, params: GenParams) {
  console.log('Running qStar');
  await qStar<Task, IntermediateStep>({
    initialProblem: {
      currentWireframeId: params.pageStructure[0].id,
      pageScreenshot: { message: null },
      wireframes: params.pageStructure.map((struct) => ({
        ...struct,
        base64String: struct.base64ImageString,
        connections: struct.componentsWithNavigationElements.map(
          (component) => ({
            fromShape: {
              type: component.type,
            } as ShapeVariations,
            toPageId: component.path!.targetPageId,
          })
        ),
      })),
      socket,
      styleguide: params.styleguide,
      model: {
        types: [],
        functions: [
          {
            name: 'App',
            parameters: '',
            definition: `
  return (
    <div style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", }}>
      <h1>The Arkhet AI Team is building your prototype.</h1>
    </div>
  );
`,
          },
        ],
        mainCode: `
ReactDOM.render(<App />, document.getElementById('root'));
`,
      },
    },
    aggregator,
    candidateGenerator,
    rewardFunction,
    isTerminal: checkFinal,
    lambda: 1,
    terminalReward: 10,
    numAlternatives: parseInt(process.env.Q_STAR_NUM_ALTERNATIVE_PATHS!),
    numExplorationSteps: parseInt(process.env.Q_STAR_ROLLOUT_STEPS!),
    communicator: communicateToFrontend,
  });
}
