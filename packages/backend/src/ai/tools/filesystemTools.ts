import { tool } from '@langchain/core/tools';
import babel from '@babel/standalone';
import type { Socket } from 'socket.io';
import { Linter } from 'eslint';
import { z } from 'zod';
import { codeModelToString, State, type CodeModel } from '../langgraph';
import { mightFailSync } from 'might-fail';
import tsParser from '@typescript-eslint/parser';
import type { PostScreenshotMessage } from '../../interfaces/ws';
import type { Task } from '../q-star/qStarGenerate';

const ReactFunctionSchema = z.object({
  name: z
    .string()
    .describe(
      'Name of the function. Use PascalCase for react components, camelCase otherwise.'
    ),
  parameters: z
    .string()
    .optional()
    .describe(
      `Parameters. Leave empty for no parameters. Example with params: "name: string, foo: string" Example without: "" `
    ),
  returnType: z
    .string()
    .optional()
    .describe(
      `: will be included automatically. Example: "string". Can be undefined if no return type should be added.`
    ),
  definition: z
    .string()
    .optional()
    .describe(
      `Full function definition inside brackets. {} will be included automatically. Leave as an empty string to make this an empty body.`
    ),
});

export function generateCodeTools(state: Task) {
  return [
    tool((params: UpdateToolParams) => updateFunctionToolImpl(params, state), {
      name: 'updateFunctionCode',
      description: `
            <instructions>
              Call to replace the code of a function by passing the new function definition.

              This tool must be called with new code to replace the old code. If no new code is passed,
              you will receive an invalid arguments error and be asked to try again.

              - if arkhet intends to update the body of this function with a new implementation, arkhet MUST pass in the "definition" parameters with code!
              - arkhet should understand that this is not a modal editor; you're passing all the new information you want this function to have immediately.
              - arkhet understand this tool can be used partially; if no return type is passed for example, it will be kept as is.

            </instructions>
    `,
      // You pass in an array of changes to this tool. If you wish to make one change only, pass an array with one item.
      schema: updateToolSchema,
    }),
    tool(
      (params: UpdateToolParams) => createNewFunctionToolImpl(params, state),
      {
        name: 'createNewFunction',
        description: `
            <instructions>

              - arkhet calls this to add a new function name and the code it consists of.
              - arkhet NEVER calls this function with a name of a function that already exists.
              - arkhet ALWAYS makes sure new functions have a purpose
              - arkhet ALWAYS makes new functions to break up repeated logic, as a professional programmer would.

            </instructions>
    `,
        schema: updateToolSchema,
      }
    ),
  ];
}

const updateToolSchema = ReactFunctionSchema.describe(
  'Schema to update function with. All values will be replaced if a matching name is found.'
);

const createNewFunctionToolSchema = ReactFunctionSchema.describe(
  'Schema for new function.'
);

const deleteFunctionToolSchema = z.object({
  functionName: z.string()
    .describe(`The name of for the function to delete. Use this to permanently remove a function
    declaration and it's implementation. 
`),
});

/**
 * Runs typescript transpilation and ESLint against generated code
 * to catch any errors early.
 *
 * If errors are found, they're returned as the output of the tool and code is not
 * sent to the frontend
 * */

export function verifyCode(code: string) {
  const { error: errorBabel } = mightFailSync(() =>
    babel.transform(code, {
      presets: ['react', 'env', 'typescript'],
      filename: 'main.tsx',
    })
  );

  if (errorBabel) {
    console.error(errorBabel, 'Error Babel');
    return `Babel Error: ${errorBabel}`;
  }

  const eslint = new Linter({ configType: 'eslintrc' });

  eslint.defineParser('@typescript-eslint/parser', tsParser);

  const { error: esLintError, result: resultESLint } = mightFailSync(() =>
    eslint.verify(code, {
      globals: {
        React: 'readonly',
        ReactDOM: 'readonly',
        JSX: 'readonly',
      },
      env: {
        browser: true, // defines "document", "window", etc.
      },
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {
        'no-undef': 'error',
      },
    })
  );

  if (esLintError) {
    console.error(esLintError, 'ESLint error');
    return `ESlint threw error: ${esLintError.message}`;
  }

  if (resultESLint.length > 0) {
    const esLintErrorStringified = JSON.stringify(
      resultESLint.map((error) => error.message),
      null,
      2
    );
    console.error('esLint linter found issue:', esLintErrorStringified);
    return `ESLint problem: ${esLintErrorStringified}`;
  }
}

export type CreateNewFunctionToolParams = z.infer<
  typeof createNewFunctionToolSchema
>;

export const updateFunctionToolImpl = async (
  input: UpdateToolParams,
  state: Task
): Promise<string> => {
  console.log('Agent modifying function name: ' + input.name);

  const functionDefIndex = state.model.functions.findIndex(
    (func) => func.name === input.name
  );

  if (functionDefIndex === -1)
    return `No function with ${input.name} exists to update.`;

  const functionReference = state.model.functions[functionDefIndex];

  const oldCode = codeModelToString(state.model);

  if (input.definition) functionReference.definition = input.definition;
  if (input.parameters) functionReference.parameters = input.parameters;
  if (input.returnType) functionReference.returnType = input.returnType;

  const updatedCode = codeModelToString(state.model);

  if (oldCode === updatedCode) {
    return `Error: This code is the exact same as the previous code! Double check your use of this tool.`;
  }
  const result = await new Promise<
    { type: 'success' } | { type: 'error'; msg: string }
  >((res) => {
    const error = verifyCode(updatedCode);
    if (error) {
      return res({
        type: 'error',
        msg: `Your action was succesful, but the code gave the following error(s). Fix them in the next update: ${error}`,
      });
    }
    emitNewCode(state, updatedCode, res);
  });
  // console.log('new code:', updatedCode);
  if (result.type === 'success') return 'Code has been succesfully updated.';
  console.error(`Error when compiling: ${result.msg}`);
  return `Error when compiling: ${result.msg}`;
};

export type UpdateToolParams = z.infer<typeof updateToolSchema>;

const createNewFunctionToolImpl = async (
  input: CreateNewFunctionToolParams,
  state: Task
): Promise<string> => {
  const exists =
    state.model.functions.findIndex((func) => func.name === input.name) !== -1;
  if (exists) {
    return `Function name already exists: ${input.name}`;
  }
  state.model.functions.push({
    ...input,
    parameters: input.parameters ? input.parameters : '',
    definition: input.definition ? input.definition : '',
  });

  const updatedCode = codeModelToString(state.model);
  const result = await new Promise<
    { type: 'success' } | { type: 'error'; msg: string }
  >((res) => {
    const error = verifyCode(updatedCode);
    if (error) {
      return res({
        type: 'error',
        msg: `Your action was succesful, but the code gave the following error(s). Fix them in the next update: ${error}`,
      });
    }
    emitNewCode(state, updatedCode, res);
  });
  // console.log('new code:', updatedCode);
  if (result.type === 'success') return 'New function created';
  console.error(`Error when compiling: ${result.msg}`);
  return `Error when compiling: ${result.msg}`;
};

export type DeleteToolParams = z.infer<typeof deleteFunctionToolSchema>;

export const deleteFunctionToolImpl = (
  input: DeleteToolParams,
  state: {
    model: CodeModel;
    socket: Socket;
    pageScreenshot: PostScreenshotMessage;
  }
) => {
  const exists =
    state.model.functions.findIndex(
      (func) => func.name === input.functionName
    ) !== -1;
  if (!exists) {
    return `No such function to delete: ${input.functionName}`;
  }

  const index = state.model.functions.findIndex(
    (func) => func.name === input.functionName
  );

  state.model.functions.splice(index, 1);
  return `Function ${input.functionName} deleted.`;
};

function emitNewCode(
  state: Task,
  updatedCode: string,
  res: (message: { type: 'success' } | { type: 'error'; msg: string }) => void
) {
  const genId = Math.floor(Math.random() * 99999);
  state.socket.emit(
    'new-code',
    { code: updatedCode, id: genId },
    async (
      result:
        | { type: 'success'; base64Result: string }
        | { type: 'error'; msg: string }
    ) => {
      if (result.type === 'success') {
        console.log('Awaiting screenshot from frontend...');
        const screenshotPromise = await new Promise<PostScreenshotMessage>(
          (res) => {
            function handle(message: PostScreenshotMessage) {
              console.log('we got mail:', {
                ...message,
                screenshot:
                  message.screenshot.length > 10 ? 'valid data...' : '',
              });
              if (message.id !== genId) return;
              state.socket.off('screenshot', handle);
              res(message);
            }
            setTimeout(() => {
              res({
                id: genId,
                valid: false,
                screenshot: '',
                type: 'screenshot',
              });
            }, 7000);
            state.socket.on('screenshot', handle);
          }
        );

        state.pageScreenshot.message = screenshotPromise;
      }

      res(result.type === 'success' ? { type: result.type } : result);
    }
  );
}
