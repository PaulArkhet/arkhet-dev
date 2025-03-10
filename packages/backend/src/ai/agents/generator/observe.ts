import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { generateClickTool, navigateTool } from '../../tools/observationTools';
import {
  humanMessageWithImage,
  clearErrors,
  type State,
  codeModelToString,
} from '../../langgraph';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { mightFail } from 'might-fail';
import { sleep } from './planner';
import {
  arkhetGeneralInfo,
  arkhetTeamInfoPrompt,
  scanForInvalidTools,
} from './actor';
import { EOL } from 'os';

const arkhetObserverExamples = `
      <arkhet_observer_examples>

        ## Example 1

          Previous Action: I edited the home page and created a basic layout
          from the give wireframe.

          Observed effect: The screenshot of the live react application shows
          a page that mostly matches the wireframe. The hero image, however, is
          taking up the full width of the page, unlike the wireframe.

        ## Example 2

          Previous Action: I corrected some styling issues on this login page.
          The password and username input fields now have placeholders as shown
          in the wireframe.

          Observed effect: The input fields indeed now show placeholders for the
          user, improving the user experience and clarity of which input are for
          what. The wireframe now looks like a high fidelity version of the
          wireframe.

      </arkhet_observer_examples>
`;

const prompt = ChatPromptTemplate.fromMessages([
  'system',
  `
    ${arkhetTeamInfoPrompt}
    ${arkhetGeneralInfo}

    <arkhet_observer_info>

      - you are arkhet-observer, an extremely advanced AI observer with strong programming knowledge.
      - arkhet-observer reviews the actions of arkhet-planner and arkhet-actor and creates a detailed report.
      - arkhet-observer understands the mission of arkhet which is to generate a prototype from a given wireframe.
      - arkhet-observer ALWAYS notices when progress is hindered and makes an observation that we should move on.
      - arkhet-observer ALWAYS looks more than one plan in the past to see what the overall progress is.
      - arkhet-observer ALWAYS looks at the plan, actions taken and new code and adds this information to its report.
      - arkhet-observer uses the navigate tool to look at other wireframe pages if necessary.

      ${arkhetObserverExamples}
    </arkhet_observer_info>
  `,
  new MessagesPlaceholder('messages'),
]);

function getAllTools(state: typeof State.State) {
  return [navigateTool];
}

const observeLLM = new BedrockChat({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 1,
});

export const observeNode = async (state: typeof State.State) => {
  const { messages, currentPageId, pageStructure } = state;
  console.log('Observe agent thinking...');

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

  const generatorWithTools = observeLLM.bindTools(getAllTools(state));
  const codeGenerationChain = prompt.pipe(generatorWithTools);

  const isToolCall = !(
    (messages.at(-1)! as AIMessage).tool_calls?.length === 0
  );

  if (isToolCall) messages.splice(messages.length - 1, 1);

  let numFails = 0;
  while (true) {
    const { error: genError, result: response } = await mightFail(
      codeGenerationChain.invoke({
        messages: [
          messages.at(-1),
          new HumanMessage({
            content: `Current page structure: ${JSON.stringify(
              pageStructure.map((pageStructure) => ({
                ...pageStructure,
                base64String: 'ommited',
              })),
              null,
              2
            )}`,
          }),
          humanMessageWithImage(
            currentWireframe,
            `wireframe of the currently selected page path: ${currentPageId}`
          ), // wireframe
          new HumanMessage({
            content: `Current code: ${codeModelToString(state.model)}`,
          }),
          new HumanMessage({
            content: `You're given the following styleguide colors to follow:
              Primary Color: ${state.styleguide.primaryColor}
              Secondary Colors: ${state.styleguide.secondaryColorStyles.firstColor}, ${state.styleguide.secondaryColorStyles.secondColor}
              Neutral Colors: ${state.styleguide.neutralColorStyles.firstColor}, ${state.styleguide.neutralColorStyles.secondColor}, ${state.styleguide.neutralColorStyles.thirdColor}
            `,
          }),
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

    clearErrors();
    return {
      messages: [
        (response as AIMessage).tool_calls?.length === 0
          ? new HumanMessage({ content: response.content })
          : response,
      ],
    };
  }
};

export async function observerToolsNode(state: typeof State.State) {
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
