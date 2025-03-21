import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { HumanMessage } from '@langchain/core/messages';
import { mightFail } from 'might-fail';
import { sleep } from './planner';
import { arkhetGeneralInfo, arkhetTeamInfoPrompt } from './prompts';

const prompt = ChatPromptTemplate.fromMessages([
  'system',
  `
    ${arkhetTeamInfoPrompt}
    ${arkhetGeneralInfo}

    <arkhet_context_info>
      - you are arkhet-context, an advanced summarization AI.
      - arkhet-context receives a context and a new event.
      - arkhet-context will combine these two to create a new summarized context.
      - arkhet-context will try to preserve recent information.
      - arkhet-context will drop information that is not relevant anymore to our AI agents.
      - arkhet-context will prioritize giving a high level overview of events. 
      - arkhet-context will NEVER include code in its summary UNLESS it's HIGHLY important for comprehensive understanding.
      - arkhet-context will reply with ONLY the newly summarized context, with no "thank you's / Here is the context:, ..."
      - arkhet-context will NEVER include information given in it's system prompt (ie, this block of text).
      - arkhet-context will ONLY include information in the "Old context" and "New action" sections.
      - arkhet-context will avoids commenting on an action and aims to only describe what's occured in a summarized way.
      - arkhet-context will give its response in a history/log style format.

      - arkhet-context will be careful with saying things like "fully implemented" or "complete" as this can make other agents think the page is completely implemented.

      - arkhet-context will make it very clear when ESLint errors are found and will make a small note that these must be fixed before finishing generation.

        <navigation_instructions>
          - arkhet-context will notice if an agent is navigating around and see that the agent will leave notes as it navigates (in the navigation tool call itself).
          - In a navigation chain, you are expected to help build up a complete context through each navigation.
          - If your old context has some information about a previous page, DON'T DISCARD IT! You MUST keep this information in the new context, preferably keeping track of the page visit order.

          - if an agent is navigating repeatedly without making progress, or going to the same page it was just at include this in your context.
          - For example: 2 consecutive navigations to the same page should have you add to the new context a warning.
          - An agent should ONLY navigate to each page at most once!
          Example warning:

          CRITICAL WARNING: Planner has navigated to page x more than once. Planer should stop navigating and formulate a plan!
        </navigation_instructions>

    </arkhet_context_info>
  `,
  new MessagesPlaceholder('messages'),
]);

const contextLLM = new BedrockChat({
  model: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
  region: process.env.BEDROCK_AWS_REGION,
  credentials: {
    accessKeyId: process.env.BEDROCK_AWS_ACCESS_KEY!,
    secretAccessKey: process.env.BEDROCK_AWS_SECRET!,
  },
  temperature: 0.1,
});

export const simplifyContext = async (args: {
  context: string;
  newEvent: string;
}) => {
  const contextRecutionChain = prompt.pipe(contextLLM);

  let numFails = 0;
  while (true) {
    const { error: genError, result: response } = await mightFail(
      contextRecutionChain.invoke({
        messages: [
          new HumanMessage(`Old context: ${args.context}`),
          new HumanMessage(`New event: ${args.newEvent}`),
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

    return response.content;
  }
};
