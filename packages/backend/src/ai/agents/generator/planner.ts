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

     <plan_examples>
      **Wireframe Description:**  
      The low-fidelity wireframe shows a top header with the application title, a prominent call-to-action button, and a horizontal navigation bar. The main content area is divided into sections for dynamic content and an interactive cart component. (Note: No comments on the color scheme are provided, as colors in the wireframe are only placeholders.)

      #### User Story 1: Landing Page Overview
      - **As a** user  
        **I want** to see a clearly structured landing page  
        **So that** I understand the app’s purpose and can easily navigate to key features.
        
        **Acceptance Criteria:**  
        - The landing page includes a header component displaying the app title in a prominent manner.  
        - A primary call-to-action button is rendered using the preexisting <Button /> component, styled per the styleguide.  
        - The page layout follows the 60/30/10 rule for dominant, secondary, and accent elements.  
        - All styles are applied inline, with the code written in TypeScript within a single TSX file.  
        - No ESLint errors are present.

      #### User Story 2: Navigation Functionality
      - **As a** user  
        **I want** to navigate between different pages seamlessly  
        **So that** I can interact with various sections of the application without full page reloads.
        
        **Acceptance Criteria:**  
        - Navigation is handled via a top-level Layout component that uses React.useState for stateful, mocked navigation.  
        - Each page is assigned a unique ID based on the given page structure.  
        - Navigation updates are performed through conditional rendering, ensuring that the page structure is correctly reflected.  
        - The navigation implementation is free of ESLint errors.

      #### User Story 3: Interactive Cart Component
      - **As a** user  
        **I want** to add items to a shopping cart  
        **So that** I can review my selections before moving to checkout.
        
        **Acceptance Criteria:**  
        - The cart component accurately updates its state when items are added or removed.  
        - "Add to Cart" buttons utilize the <Button /> component and follow inline style guidelines.  
        - The component behavior aligns with realistic interactions—displaying updated item counts and totals—with all interactions verified to be error-free in ESLint.  
        - All interactive text is realistic and not placeholder.

      #### User Story 4: <App /> Component Integrity
      - **As a** developer  
        **I want** the <App /> component to properly initialize the application  
        **So that** it serves as a reliable entry point for all subsequent navigation and interactions.
        
        **Acceptance Criteria:**  
        - The <App /> component sets up the topmost Layout component and properly integrates all subcomponents within the same TSX file.  
        - Navigation logic is reviewed against the page structure, ensuring that each unique page ID is correctly mapped.  
        - The implementation is confirmed to have no ESLint errors.  
        - The component structure reflects the low-fidelity wireframe’s layout and interaction design.

      ---

      ### Example Plan 2: Extended Navigation and Interactive Components

      **Wireframe Description:**  
      The wireframe presents a split-screen design with a sidebar navigation menu on the left and a main content area on the right. The layout includes interactive sections such as a user profile area and a dynamic content feed, with clear segmentation of components.

      #### User Story 1: Sidebar Navigation Menu
      - **As a** user  
        **I want** to use a sidebar navigation menu  
        **So that** I can quickly access different sections of the application.
        
        **Acceptance Criteria:**  
        - The sidebar displays a list of menu items that correspond to unique page IDs from the given page structure.  
        - Clicking a sidebar item updates the main content area through state management using React.useState.  
        - All styling is applied inline and adheres to the styleguide’s color palette and layout rules.  
        - The sidebar navigation is fully functional with no ESLint errors.

      #### User Story 2: Dynamic Content Feed
      - **As a** user  
        **I want** to view a dynamic content feed that updates based on my interactions  
        **So that** I always see the latest information without manual page refreshes.
        
        **Acceptance Criteria:**  
        - The main content area displays dynamic content sections that refresh when a different category is selected from the sidebar.  
        - All interactive elements, including buttons and content areas, are styled with inline styles and use existing components where applicable.  
        - The dynamic updates are managed through React state and show realistic text content.  
        - The implementation is validated with no ESLint issues.

      #### User Story 3: User Profile Component
      - **As a** user  
        **I want** to view and update my profile information  
        **So that** I can maintain accurate personal details within the application.
        
        **Acceptance Criteria:**  
        - A user profile component is available within the main content area that displays realistic, non-placeholder user information.  
        - Profile updates (e.g., editing name, email) are clearly delineated by interactive elements, even though code examples are not provided.  
        - All actions are styled inline and conform to the styleguide.  
        - The profile component integrates seamlessly with the overall page structure and is free from ESLint errors.

      #### User Story 4: Consistency of the <App /> Component
      - **As a** developer  
        **I want** the <App /> component to remain the reliable entry point  
        **So that** it initializes and ties together the sidebar, content feed, and profile components consistently.
        
        **Acceptance Criteria:**  
        - The <App /> component is responsible for assembling the Layout component that manages the sidebar and main content area.  
        - It ensures that the navigation state and unique page IDs are correctly managed according to the provided routing info.  
        - The component is verified to be free from ESLint errors, with all interactions fully tested.  
        - The structure adheres strictly to the low-fidelity wireframe’s design, ensuring a coherent and complete prototype.

     </plan_examples>

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
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
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
