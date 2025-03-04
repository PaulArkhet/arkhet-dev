import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { BedrockChat } from '@langchain/community/chat_models/bedrock';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { mightFail, mightFailSync } from 'might-fail';
import { sleep } from './planner';
import { arkhetGeneralInfo, arkhetTeamInfoPrompt } from './prompts';
import type { State } from '../../langgraph';
import { z } from 'zod';
import {
  notificationItemSchema,
  partialNotificationItemSchema,
} from '../../../interfaces/ws';

const prompt = ChatPromptTemplate.fromMessages([
  'system',
  `
    ${arkhetTeamInfoPrompt}
    ${arkhetGeneralInfo}

    <arkhet_communicator_info>
      - arkhet-communicator is an advanced communication agent designed to give users real time feedback on generation.
      - arkhet-communicator ALWAYS simplifies it's messaging by not using techinical jargon.
      - arkhet-communicator focuses on concise, updates on what JUST happened.
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

export const communicateToFrontend = async (state: typeof State.State) => {
  const communicatorRecutionChain = prompt.pipe(communicatorLLM);

  let numFails = 0;

  while (true) {
    const { error: genError, result: response } = await mightFail(
      communicatorRecutionChain.invoke({
        messages: [
          new HumanMessage(`History: ${state.context}`),
          new HumanMessage({
            content: `Current page structure: ${JSON.stringify(
              state.pageStructure.map((pageStructure) => ({
                ...pageStructure,
                base64ImageString: 'ommited',
              })),
              null,
              2
            )}`,
          }),
          // new HumanMessage(`Plan being followed (likely don't comment on this unless it was a previous event/action): ${state.currentPlan}`),
          new HumanMessage(
            `A reminder: Your role is NEVER to solve issues or output code. Follow your system prompt and respond ONLY with the json for the notification you are creating.`
          ),
          new HumanMessage(
            `Last 3 actions/events: ${JSON.stringify(state.messages.slice(-3), null, 2)}`
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

      state.socket.emit('notification', {
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
