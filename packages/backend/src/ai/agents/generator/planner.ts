import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import {
  humanMessageWithImage,
  type State,
  codeModelToString,
} from '../../langgraph';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { mightFail } from 'might-fail';
import { navigateTool } from '../../tools/observationTools';
import { simplifyContext } from './contextManagement';
import { arkhetGeneralInfo, arkhetTeamInfoPrompt } from './prompts';
import { communicateToFrontend } from './communicator';
import { getLiveReactScreenshotMessage } from './actor';

const prompt = ChatPromptTemplate.fromMessages([
  'system',
  `
  <arkhet_info>

    ${arkhetTeamInfoPrompt}
    ${arkhetGeneralInfo}

   <arkhet_planner_info>
   - You are arkhet-planner, an extremely advanced AI planner with strong programming knowledge.
   - arkhet-planner creates a plan for other members of the team to use, specifically arkhet-actor
   - arkhet-planner understands the constraints that arkhet-actor has to work with, outlined in the general info section
   - arkhet-planner understands that the goal is to create a plan for the creation of a prototype
   - arkhet-planner ALWAYS builds its plans step by step.
   - arkhet-planner NEVER repeats the same plan as the last iteration
   - arkhet-planner ALWAYS gives specific instructions that lead to significant improvements over the last iteration
   - arkhet-planner NEVER gives code examples; that should be left to arkhet-actor.
   - arkhet-planner ALWAYS describes the wireframe screenshot it sees before giving its plan.
   - arkhet-planner uses the navigate tool ONLY IF the current page plan has been executed (meaning the ACTOR agent has implemented a page fully) and we should look at another page.
   - arkhet-planner NEVER uses vague descriptions like "improve styling" or "adjust to fit layout."
   - arkhet-planner ALWAYS gives specific, clear, detailed instructions when suggesting changes or actions. 
   - arkhet-planner NEVER comments on the colors of the wireframe as they are; All wireframes will have dark background because color information is not conveyed in the wireframe.
   - arkhet-planner ALWAYS double checks if navigation has been setup correctly according to the page structure.
 
   - arkhet-planner is aware that a "page" may not necessarily be a new page, but a variation of a singular page designed to show off interaction or different states of a page.

   - arkhet-planner will decide when generation is done. If pages are complete and there are NO ESLINT ERRORS, simply reply with: 
      1. An explanation as to why you believe generation is done. 
      2. The last line in your response being: "END GENERATION" to STOP WORK completely. The current code will be the FINAL PRODUCT once you reply in this fashion!

     <arkhet_planner_end_generation_acceptance_criteria>

       - arkhet-planner NEVER ends generation unless all ESlint errors are fixed!
       - arkhet-planner NEVER ends generation unless the react code is considered complete and no further action is required!
       - arkhet-planner ALWAYS pays special attention the the <App /> component; this is the entry point into the application and must be updated before generation can finish.
       - arkhet-planner ALWAYS reviews the given "Live react app screenshot" for discrepancies to the wireframe.
       - arkhet-planner ALWAYS considers interactions within a page. For example: a cart should hold item data and update when new items are added. Buttons should all work.
       - arkhet-planner ALWAYS considers the 60/30/10 rule:
        - 60% of the mockup should be made up of the dominant hue
        - 30% should be the secondary color
        - the remaining 10% should be an accent color

       - arkhet-planner ALWAYS considers visual quality; If buttons are too wide, images are cutoff, so on.

       - arkhet-planner ALWAYS check through EVERY PAGE and double checks if functionality is as intended before finishing generation.

       - If any of these criteria are not met, a new plan should be created to resolve these issues.
     </arkhet_planner_end_generation_acceptance_criteria>

   </arkhet_planner_info>
  </arkhet_info>



  `,
  new MessagesPlaceholder('messages'),
]);

export const sleep = (ms: number): Promise<void> => {
  console.log(`sleeping ${ms}ms`);

  return new Promise((res) =>
    setTimeout(() => {
      res();
    }, ms)
  );
};

function getAllTools(state: typeof State.State) {
  return [navigateTool];
}

const reasonLLM = new BedrockChat({
  model: 'us.anthropic.claude-3-7-sonnet-20250219-v1:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 0.2,
});

export const reasonNode = async (state: typeof State.State) => {
  const { currentPageId, pageStructure } = state;
  console.log('Planning agent thinking...');

  const currentWireframe = pageStructure.find(
    (pageStruct) => pageStruct.id == currentPageId
  )?.base64ImageString;
  if (!currentWireframe)
    throw new Error(
      `currentPageId: ${currentPageId} does not exist in pageStructure: ${JSON.stringify(
        pageStructure.map((wireframe) => ({
          id: wireframe.id,
          base64String: 'ommited',
        })),
        null,
        2
      )}`
    );

  const generatorWithTools = reasonLLM.bindTools(getAllTools(state));
  const codeGenerationChain = prompt.pipe(generatorWithTools);

  let numFails = 0;
  while (true) {
    const { error: genError, result: response } = await mightFail(
      codeGenerationChain.invoke({
        messages: [
          humanMessageWithImage(
            currentWireframe,
            `wireframe of the currently selected page path: ${currentPageId}`
          ), // wireframe
          getLiveReactScreenshotMessage(state.pageScreenshot.message),
          new HumanMessage({
            content: `You're given the following styleguide colors to follow:
              Primary Color: ${state.styleguide.primaryColor}
              Secondary Colors: ${state.styleguide.secondaryColorStyles.firstColor}, ${state.styleguide.secondaryColorStyles.secondColor}
              Neutral Colors: ${state.styleguide.neutralColorStyles.firstColor}, ${state.styleguide.neutralColorStyles.secondColor}, ${state.styleguide.neutralColorStyles.thirdColor}
            `,
          }),
          new HumanMessage({
            content: `Current code: ${codeModelToString(state.model)}`,
          }),
          new HumanMessage({
            content: `Current page structure: ${JSON.stringify(
              pageStructure.map((pageStructure) => ({
                ...pageStructure,
                base64ImageString: 'ommited',
              })),
              null,
              2
            )}`,
          }),
          new HumanMessage(`History: \n ${state.context}`),
        ],
      })
    );

    //  console.log(messages);

    if (genError) {
      numFails++;
      if (numFails === 8) {
        throw new Error('Maximum retry limit hit.');
      }
      console.error(genError);
      await sleep(Math.pow(numFails, 2) * 2000 - 1000);
      continue;
    }

    const isToolCall = !((response as AIMessage).tool_calls?.length === 0);
    if (isToolCall) console.log((response as AIMessage).tool_calls![0].name);
    else console.log(response.content);

    communicateToFrontend(state);

    if (isToolCall) {
      return {
        messages: [response],
        context: simplifyContext({
          context: state.context
            ? state.context
            : 'Nothing done for this plan.',
          newEvent: `Planner agent tool use: ${JSON.stringify(response, null, 2)}`,
        }),
      };
    }

    return {
      messages: (response.content as string).includes('END GENERATION')
        ? [response]
        : [],
      currentPlan: response.content,
      numToolCalls: 0,
      numReactCycles: state.numReactCycles + 1,
    };
  }
};

export async function reasonToolsNode(state: typeof State.State) {
  const toolNode = new ToolNode(getAllTools(state));

  const result = await toolNode.invoke({
    ...state,
  });

  const stateStep = {
    currentPageId:
      result.messages[0].name === 'navigate'
        ? result.messages[0].content
        : state.currentPageId,
    pageStructure: state.pageStructure,
    messages: result.messages,
    numReactCycles: state.numReactCycles,
  };

  return stateStep;
}
