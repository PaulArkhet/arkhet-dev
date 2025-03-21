import { END, StateGraph, START, Annotation } from '@langchain/langgraph';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { EOL } from 'os';
import { actNode, actToolsNode } from './agents/generator/actor';
import { reasonNode, reasonToolsNode } from './agents/generator/planner';
import { z } from 'zod';
import type { Socket } from 'socket.io';
import type { GenParams, PageStructure } from '../controllers/ai';
import type { StyleguideWithJoins } from '../services/styleguide.service';
import {
  notificationItemSchema,
  type PostScreenshotMessage,
} from '../interfaces/ws';

export type BasePage = {
  base64ImageString: string;
  name: string;
};

export const SEQUENTIAL_TOOL_CALL_LIMIT = 9999;
export const REACT_CYCLE_LIMIT = 9999;

export type Pages = {
  name: string;
  complete: boolean;
  path?: string;
}[];

export const sleep = (ms: number): Promise<void> => {
  console.log(`sleeping ${ms}ms`);

  return new Promise((res) =>
    setTimeout(() => {
      res();
    }, ms)
  );
};

export function humanMessageWithImage(
  base64ImageString: string,
  description: string
): HumanMessage {
  return new HumanMessage({
    content: [
      { type: 'image_url', image_url: { url: base64ImageString } },
      {
        type: 'text',
        text: description,
      },
    ],
  });
}

export const State = Annotation.Root({
  // the router needs to complete all of these
  pageStructure: Annotation<PageStructure[]>({
    reducer: (_, y) => y,
  }),
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  currentPageId: Annotation<string>({
    reducer: (_, y) => y,
  }),
  pageScreenshot: Annotation<{ message: PostScreenshotMessage | null }>({
    reducer: (_, y) => y,
  }),
  numToolCalls: Annotation<number>({
    reducer: (_, y) => y,
  }),
  numReactCycles: Annotation<number>({
    reducer: (_, y) => y,
  }),
  currentPlan: Annotation<string>({
    reducer: (_, y) => y,
  }),
  model: Annotation<CodeModel>({
    reducer: (_, y) => y,
  }),
  socket: Annotation<Socket>({
    reducer: (prev, _) => prev,
  }),
  styleguide: Annotation<StyleguideWithJoins>({
    reducer: (prev, _) => prev,
  }),
  context: Annotation<string>({
    reducer: (_, incoming) => incoming,
  }),
});

export let newErrors: string[] = [];

export function clearErrors() {
  newErrors = [];
}

export const lastErrors = (n: number) => {
  const allErrors = newErrors.concat(newErrors);
  return allErrors.slice(allErrors.length - n).join(EOL);
};

function shouldReasonContinue(state: typeof State.State) {
  const { messages } = state;
  const lastMessage = messages.at(-1) as AIMessage;

  if (lastMessage && lastMessage.tool_calls?.length) {
    console.log('Going to reasonTools...');
    return 'reasonTools';
  }

  console.log('last message', lastMessage?.content);
  if (
    lastMessage &&
    (lastMessage.content as string).includes('END GENERATION')
  ) {
    return END;
  }

  console.log('Going to act...');
  return 'act';
}

function shouldActContinue(state: typeof State.State) {
  const { messages, numToolCalls } = state;
  const lastMessage = messages.at(-1) as AIMessage;

  if (numToolCalls > SEQUENTIAL_TOOL_CALL_LIMIT) {
    console.log('Tool call limit reached...');
    return 'resetTools';
  }

  if (lastMessage.tool_calls?.length) {
    return 'actTools';
  }

  console.log('Going to reason node...');
  return 'reason';
}

function shouldObserverContinue(state: typeof State.State) {
  const { messages } = state;
  const lastMessage = messages.at(-1) as AIMessage;

  if (lastMessage.tool_calls?.length) {
    return 'observerTools';
  }

  return 'reason';
}

const resetToolCountNode = () => {
  return {
    numToolCalls: 0,
  };
};

const workflow = new StateGraph(State)
  .addNode('reason', reasonNode)
  .addNode('act', actNode)
  .addNode('reasonTools', reasonToolsNode)
  .addNode('actTools', actToolsNode)
  .addNode('resetTools', resetToolCountNode)
  .addEdge('resetTools', 'reason')
  .addEdge('reasonTools', 'reason')
  .addEdge('actTools', 'act')
  .addConditionalEdges('reason', shouldReasonContinue)
  .addConditionalEdges('act', shouldActContinue)
  .addEdge(START, 'reason');

const app = workflow.compile();

export const ReactFunctionSchema = z.object({
  name: z.string(),
  parameters: z.string(),
  returnType: z.string().optional(),
  definition: z.string(),
});

export type ReactFunction = z.infer<typeof ReactFunctionSchema>;

// New schema for top-level type definitions.
export const TopLevelTypeSchema = z.object({
  name: z.string(),
  definition: z
    .string()
    .describe(
      'The definition for the type. This can be an interface or type alias declaration (without the "type" keyword, which will be added).'
    ),
});

export type TopLevelType = z.infer<typeof TopLevelTypeSchema>;

// Updated CodeModel now holds types in addition to functions.
export type CodeModel = {
  types: TopLevelType[];
  functions: ReactFunction[];
  mainCode: string;
};

// Updated stringifier: types are output first at the top, then functions, then main code.
export function codeModelToString(model: CodeModel): string {
  const typeStrings = model.types.map(
    (typeDef) => `type ${typeDef.name} = ${typeDef.definition};`
  );

  const functionStrings = model.functions.map((functionDef) => {
    let functionString =
      `function ${functionDef.name}(${functionDef.parameters})` +
      `${functionDef.returnType ? `: ${functionDef.returnType}` : ''} {
  ${functionDef.definition}
}`;
    return functionString;
  });

  const allParts = [...typeStrings, ...functionStrings, model.mainCode];
  return allParts.join('\n\n');
}

export async function runApp(
  pageStructure: PageStructure[],
  socket: Socket,
  params: GenParams
) {
  console.log('sending notif...');
  socket.emit('notification', {
    id: 0,
    title: 'Starting generation',
    body: `Running for ${pageStructure.length} pages...`,
  } as z.infer<typeof notificationItemSchema>);

  const initialState: typeof State.State = {
    currentPageId: pageStructure[0].id,
    currentPlan: 'No plans yet.',
    context: 'Nothing has happened yet.',
    messages: [],
    pageScreenshot: { message: null },
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
    pageStructure,
    numToolCalls: 0,
    numReactCycles: 0,
    socket,
    styleguide: params.styleguide,
  };
  await app.invoke(initialState, { recursionLimit: 400 });
}
