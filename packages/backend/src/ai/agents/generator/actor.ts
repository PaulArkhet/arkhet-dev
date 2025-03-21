import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { generateClickTool, navigateTool } from '../../tools/observationTools';
import {
  clearErrors,
  codeModelToString,
  sleep,
  type State,
} from '../../langgraph';
import { AIMessage, HumanMessage, ToolMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { mightFail } from 'might-fail';
import { humanMessageWithImage } from '../../langgraph';
import { generateCodeTools } from '../../tools/filesystemTools';
import { simplifyContext } from './contextManagement';
import { arkhetGeneralInfo, arkhetTeamInfoPrompt } from './prompts';
import { communicateToFrontend } from './communicator';
import type { PostScreenshotMessage } from '../../../interfaces/ws';

const prompt = ChatPromptTemplate.fromMessages([
  'system',
  `
  <arkhet_info>

    ${arkhetTeamInfoPrompt}

    ${arkhetGeneralInfo}

   <arkhet_actor_info>
   - You are arkhet-actor, an extremely advanced AI programmer.
  
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

   - arkhet-actor will prioritise getting code without ESLint reference errors when possible.
    - this means creating stubs for undefined components as a priority. Reference errors are okay only temporarily.
   - arkhet-actor ALWAYS pays special attention the the <App /> component; this is the entry point into the application and must be updated before generation can finish.
   
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

  </arkhet_info>

  `,
  new MessagesPlaceholder('messages'),
]);

/* add this back in; it's quite simple to do...
  <foundation_model_component_documentation>

  When you see the robot icon in the wireframe, refer to these docs:

  You are given in the components / folder, a react component called "FoundationModel". The foundation model
  is an AI chat component. You can supply some configuration to determine how it should behave and look.
  
  This component takes the 
  following props:

    system: string; // system message for the AI chatbot
    placeholder: string; // placeholder text in input component.
    firstMessage?: string; // optional first message that the AI can send the user to start conversation.
    style: 
      userBubble: (background: string; textColor: string) // user text bubble styling
      assistant: (textColor: string ); // assistant chat has no background, but can have a text color.
      submitButton: ( textColor: string; backgroundColor: string); // submit button styling

    The component will fill it's parent height and width. Please make sure to restrict it's height so that
    chat messages don't cause it to overflow.

  </foundation_model_documentation>
  * */

function getAllTools(state: typeof State.State) {
  return [
    // ...generateUpdatePagesTools(state.pageStructure),
    ...generateCodeTools(state),
    // generateClickTool(state.socket),
    navigateTool,
  ];
}

export function getLiveReactScreenshotMessage(
  message: PostScreenshotMessage | null
) {
  return !message
    ? new HumanMessage('')
    : !message.valid
      ? new HumanMessage(
        'The screenshot received shows an empty root div with no rendered elements!'
      )
      : humanMessageWithImage(
        message.screenshot,
        'Wireframe of the rendered react app. Use this to check accuracy to the given wireframe.'
      );
}

const generatorLLM = new BedrockChat({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 0.2,
});

export function getNLast(array: Array<any>, numBack: number) {
  return array.slice(array.length > numBack ? array.length - numBack : 0);
}

export const actNode = async (state: typeof State.State) => {
  const {
    messages,
    currentPageId,
    numToolCalls,
    numReactCycles,
    currentPlan,
    pageStructure,
  } = state;
  console.log('Actor agent thinking...');

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

  const generatorWithTools = generatorLLM.bindTools(getAllTools(state));
  const codeGenerationChain = prompt.pipe(generatorWithTools);

  let numFails = 0;
  while (true) {
    const { error: genError, result: response } = await mightFail(
      codeGenerationChain.invoke({
        messages: [
          humanMessageWithImage(
            currentWireframe,
            `wireframe of the currently selected page path: ${currentPageId}`
          ),
          getLiveReactScreenshotMessage(state.pageScreenshot.message),
          new HumanMessage({
            content: `You're given the following styleguide colors to follow:
              Primary Color: ${state.styleguide.primaryColor}
              Secondary Colors: ${state.styleguide.secondaryColorStyles.firstColor}, ${state.styleguide.secondaryColorStyles.secondColor}
              Neutral Colors: ${state.styleguide.neutralColorStyles.firstColor}, ${state.styleguide.neutralColorStyles.secondColor}, ${state.styleguide.neutralColorStyles.thirdColor}
            `,
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
          new HumanMessage({ content: `Current plan: ${currentPlan}` }),
          new HumanMessage(`History: \n ${state.context}`),
          new HumanMessage({
            content: `Current code: ${codeModelToString(state.model)}`,
          }),
          new HumanMessage({
            content: `You've made ${numToolCalls} sequential tool calls.
            ${numToolCalls > 6 ? "You've made more than 6 tool calls in a row. Stop using tools and allow other agents of the team to review your work!" : ''}`,
          }),
          /*
humanMessageWithImage(
await getScreenshot(state.socket),
"Current react page"
),
*/
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

    const isToolCall = !((response as AIMessage).tool_calls?.length === 0);
    if (isToolCall) console.log((response as AIMessage).tool_calls![0].name);
    else console.log(response.content);

    console.log('Number of tool calls ', numToolCalls);

    communicateToFrontend(state);

    return isToolCall
      ? {
        messages: [response],
        context: simplifyContext({
          context: state.context,
          newEvent: `Actor agent tool use: ${JSON.stringify(response, null, 2)}`,
        }),
      }
      : {
        context: simplifyContext({
          context: state.context,
          newEvent: `Actor agent response: ${response.content.toString()}`,
        }),
        numToolCalls: isToolCall ? numToolCalls + 1 : 0,
        numReactCycles: !isToolCall ? numReactCycles + 1 : numReactCycles,
      };
  }
};

export function scanForInvalidTools(
  state: typeof State.State,
  numSlices: number
) {
  // refactor this abomination!
  return (
    state.messages.at(-numSlices) instanceof ToolMessage ||
    state.messages.slice(0, state.messages.length - numSlices).some(
      (message, index) =>
        message._getType() === 'ai' && // message is an ai msg
        (message as AIMessage).tool_calls!.length > 0 && // message has tool call
        !(state.messages[index + 1] instanceof ToolMessage) // next msg is not a tool message
    )
  );
}

export async function actToolsNode(state: typeof State.State) {
  const toolNode = new ToolNode(getAllTools(state));

  const result = await toolNode.invoke({
    ...state,
  });

  const { numReactCycles } = state;

  const stateStep = {
    currentPageId:
      result.messages[0].name === 'navigate'
        ? result.messages[0].content
        : state.currentPageId,
    pageStructure: state.pageStructure,
    messages: result.messages,
    numToolCalls: state.numToolCalls + 1,
    numReactCycles,
    context: simplifyContext({
      context: state.context,
      newEvent: `Actor tool use result: ${JSON.stringify(result.messages.at(-1), null, 2)}`,
    }),
  };

  return stateStep;
}
