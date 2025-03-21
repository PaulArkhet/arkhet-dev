import { tool } from '@langchain/core/tools';
import babel from '@babel/standalone';
import { Linter } from 'eslint';
import { z } from 'zod';
import { codeModelToString, type CodeModel } from '../langgraph';
import { mightFailSync } from 'might-fail';
import tsParser from '@typescript-eslint/parser';
import type { PostScreenshotMessage } from '../../interfaces/ws';
import type { Task } from './qStarGenerate';

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

// const actionMap: Record<
//   LLMAction['type'],
//   {
//     schema: any;
//     transform: (result: any) => any;
//   }
// > = {
//   think: {
//     schema: thinkSchema,
//     transform: (result) => result.think,
//   },
//   submitForReview: {
//     schema: z.object({ reviewDetails: z.string() }),
//     transform: (result) => result.reviewDetails,
//   },
//   changeFocusedWireframe: {
//     schema: changeFocusedWireframeSchema,
//     transform: (result) => result.id,
//   },
//   createFunction: {
//     schema: createNewFunctionToolSchema,
//     transform: (result) => result,
//   },
//   updateFunction: {
//     schema: updateToolSchema,
//     transform: (result) => result,
//   },
//   deleteFunction: {
//     schema: deleteFunctionToolSchema,
//     transform: (result) => result,
//   },
// };

// Schema for top-level type definitions.
export const TopLevelTypeSchema = z.object({
  name: z.string().describe('The unique name of the type.'),
  definition: z
    .string()
    .describe(
      'The TypeScript type definition (e.g. "{ a: number; b: string }" or an interface body).'
    ),
});

export type TopLevelType = z.infer<typeof TopLevelTypeSchema>;

// Schemas for the type tools.
const createNewTypeSchema = TopLevelTypeSchema.describe(
  `Schema for creating a new top-level type definition.
  
  <instructions>
    - Use this tool to add a new type.
    - The type name must be unique.
    - Provide the type definition as a string.
  </instructions>`
);

const updateTypeSchema = TopLevelTypeSchema.describe(
  `Schema for updating an existing top-level type definition.
  
  <instructions>
    - Use this tool to update an existing type.
    - Provide the new definition to replace the current one.
  </instructions>`
);

const deleteTypeSchema = z.object({
  name: z.string().describe('The name of the type to delete.'),
});

export type CreateNewTypeParams = z.infer<typeof createNewTypeSchema>;
export type UpdateTypeParams = z.infer<typeof updateTypeSchema>;
export type DeleteTypeParams = z.infer<typeof deleteTypeSchema>;

const submitForReviewSchema = z.object({
  reviewDetails: z.string(),
});

export const thinkSchema = z.object({
  think: z.string().describe('Your thinking step.'),
});

export const changeFocusedWireframeSchema = z.object({
  id: z.string().describe(`The unique ID of the page you're navigating to.`),
});

export const deleteFunctionToolSchema = z.object({
  functionName: z.string()
    .describe(`The name of for the function to delete. Use this to permanently remove a function
    declaration and it's implementation. 
`),
});

type SubmitForReviewToolParams = z.infer<typeof submitForReviewSchema>;

export function generateTools(state: Task) {
  return [
    tool((params: SubmitForReviewToolParams) => params.reviewDetails, {
      name: 'submitForReview',
      description: `
          Call to submit your final, esLint error free code for review. It will be evaluated through static code checks.
          Only submit complete, feature complete and requirement finishing code through this tool.

          This means ALL pages have been fully implemented. If only one page has been implemented, you should use the change focused wireframe tool instead.
          `,
      schema: submitForReviewSchema,
    }),
    tool((params: z.infer<typeof thinkSchema>) => params.think, {
      name: 'think',
      description: `
      Use this tool to start and continue a reasoning chain. This can help plan step by step, solve complex problems and
      form a chain of thought. You should use this tool when you're about to do something complex that requires planning.
      Do not use this tool excessively, as continously thinking will not get you closer to your objective if no actual implementation is done.

      Also, this tool is a great option to store information about the wireframe you're currently looking at should you navigate to another wireframe.
      `,
      schema: thinkSchema,
    }),
    tool((params: z.infer<typeof changeFocusedWireframeSchema>) => params.id, {
      name: 'changeFocusedWireframe',
      description: `
      Use this tool to change the currently focused wireframe you're looking at. This lets you work on other parts of the application.
      You should work on the application page by page, so don't move away from a page unless it's complete.

      This will show you a new wireframe screenshot once used.

      You should use this when you have finished a page and need to work on other pages of the application.
      `,
      schema: changeFocusedWireframeSchema,
    }),
    tool((params: UpdateToolParams) => updateFunctionToolImpl(params, state), {
      name: 'updateFunctionCode',
      description: `
        Call to replace the code of a function by passing the new function definition.

        This tool must be called with new code to replace the old code. If no new code is passed,
        you will receive an invalid arguments error and be asked to try again.

        - if arkhet intends to update the body of this function with a new implementation, arkhet MUST pass in the "definition" parameters with code!
        - arkhet should understand that this is not a modal editor; you're passing all the new information you want this function to have immediately.
        - arkhet understand this tool can be used partially; if no return type is passed for example, the return type will be kept as is.

        - A common mistake is to pass in the name and parameters but no definition when we plan to modify the contents of the function.
        - This type of tool call is invalid and will NOT UPDATE the code!
        - This tool should be used when we're ready to make updates or improvements to the codebase. If the planning and reasoining steps clearly
        describe what we should do, then we use this tool (or the create tool) to begin improving the codebase.

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
    tool(
      (params: z.infer<typeof deleteFunctionToolSchema>) =>
        deleteFunctionToolImpl(params, state),
      {
        name: 'deleteFunction',
        description: `
        Use this tool to delete a function completely from the codebase. This action cannot be reverted, so use it carefully when
        refactoring or removing old functionality.
    `,
        schema: deleteFunctionToolSchema,
      }
    ),
    tool(
      async (
        input: CreateNewTypeParams
      ): Promise<{ msg: string; model: CodeModel }> => {
        console.log('Agent adding new type: ' + input.name);

        // Check if type already exists.
        if (
          state.model.types.find((t: TopLevelType) => t.name === input.name)
        ) {
          return {
            msg: `Error: Type ${input.name} already exists.`,
            model: state.model,
          };
        }

        // Create a deep copy of the current model.
        const newModel: CodeModel = JSON.parse(JSON.stringify(state.model));
        newModel.types.push(input);

        const updatedCode = codeModelToString(newModel);
        const error = verifyCode(updatedCode);
        if (error) {
          return {
            msg: `Error creating type: ${error}`,
            model: newModel,
          };
        }

        const result = await new Promise<
          { type: 'success' } | { type: 'error'; msg: string }
        >((res) => {
          const errorCheck = verifyCode(updatedCode);
          if (errorCheck) {
            return res({
              type: 'error',
              msg: `Your action was successful, but the code gave the following error(s). Fix them in the next update: ${errorCheck}`,
            });
          }
          emitNewCode(state, updatedCode, res);
        });

        if (result.type === 'success') {
          return { msg: 'success', model: newModel };
        }
        console.error(`Error when compiling: ${result.msg}`);
        return { msg: `Error when compiling: ${result.msg}`, model: newModel };
      },
      {
        name: 'createNewType',
        description: 'Add a new top-level type definition to the codebase.',
        schema: createNewTypeSchema,
      }
    ),
    tool(
      async (
        params: UpdateTypeParams
      ): Promise<{ msg: string; model: CodeModel }> => {
        console.log('Agent updating type: ' + params.name);

        const typeIndex = state.model.types.findIndex(
          (t: TopLevelType) => t.name === params.name
        );
        if (typeIndex === -1) {
          return {
            msg: `Error: Type ${params.name} does not exist.`,
            model: state.model,
          };
        }

        // Create a deep copy of the current model.
        const newModel: CodeModel = JSON.parse(JSON.stringify(state.model));
        newModel.types[typeIndex] = params;

        const updatedCode = codeModelToString(newModel);
        const error = verifyCode(updatedCode);
        if (error) {
          return {
            msg: `Error updating type: ${error}`,
            model: newModel,
          };
        }

        const result = await new Promise<
          { type: 'success' } | { type: 'error'; msg: string }
        >((res) => {
          const errorCheck = verifyCode(updatedCode);
          if (errorCheck) {
            return res({
              type: 'error',
              msg: `Your action was successful, but the code gave the following error(s). Fix them in the next update: ${errorCheck}`,
            });
          }
          emitNewCode(state, updatedCode, res);
        });

        if (result.type === 'success') {
          return { msg: 'success', model: newModel };
        }
        console.error(`Error when compiling: ${result.msg}`);
        return { msg: `Error when compiling: ${result.msg}`, model: newModel };
      },
      {
        name: 'updateType',
        description: 'Update an existing top-level type definition.',
        schema: updateTypeSchema,
      }
    ),

    // Tool to delete an existing type.
    tool(
      async (
        params: DeleteTypeParams
      ): Promise<{ msg: string; model: CodeModel }> => {
        console.log('Agent deleting type: ' + params.name);

        const exists = state.model.types.find(
          (t: TopLevelType) => t.name === params.name
        );
        if (!exists) {
          return {
            msg: `Error: Type ${params.name} does not exist.`,
            model: state.model,
          };
        }

        // Create a deep copy of the current model.
        const newModel: CodeModel = JSON.parse(JSON.stringify(state.model));
        newModel.types = newModel.types.filter(
          (t: TopLevelType) => t.name !== params.name
        );

        const updatedCode = codeModelToString(newModel);

        const result = await new Promise<
          { type: 'success' } | { type: 'error'; msg: string }
        >((res) => {
          const errorCheck = verifyCode(updatedCode);
          if (errorCheck) {
            return res({
              type: 'error',
              msg: `Your action was successful, but the code gave the following error(s). Fix them in the next update: ${errorCheck}`,
            });
          }
          emitNewCode(state, updatedCode, res);
        });

        if (result.type === 'success') {
          return { msg: 'success', model: newModel };
        }
        console.error(`Error when compiling: ${result.msg}`);
        return { msg: `Error when compiling: ${result.msg}`, model: newModel };
      },
      {
        name: 'deleteType',
        description:
          'Delete an existing top-level type definition from the codebase.',
        schema: deleteTypeSchema,
      }
    ),
  ];
}

export const updateToolSchema = ReactFunctionSchema.describe(
  `Schema to update function with. All values will be replaced if a matching name is found.
  <instructions>
    Call to replace the code of a function by passing the new function definition.

    This tool must be called with new code to replace the old code. If no new code is passed,
    you will receive an invalid arguments error and be asked to try again.

    - if arkhet intends to update the body of this function with a new implementation, arkhet MUST pass in the "definition" parameters with code!
    - arkhet should understand that this is not a modal editor; you're passing all the new information you want this function to have immediately.
    - arkhet understand this tool can be used partially; if no return type is passed for example, it will be kept as is.

  </instructions>
  `
);

export const createNewFunctionToolSchema = ReactFunctionSchema.describe(
  `Schema for new function.
    <instructions>

      - arkhet calls this to add a new function name and the code it consists of.
      - arkhet NEVER calls this function with a name of a function that already exists.
      - arkhet ALWAYS makes sure new functions have a purpose
      - arkhet ALWAYS makes new functions to break up repeated logic, as a professional programmer would.

    </instructions>
  `
);

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
): Promise<{ msg: string; model: CodeModel }> => {
  console.log('Agent modifying function name: ' + input.name);

  const functionDefIndex = state.model.functions.findIndex(
    (func) => func.name === input.name
  );

  if (functionDefIndex === -1)
    return {
      msg: `No function with ${input.name} exists to update.`,
      model: state.model,
    };

  // Create a deep copy of the current model to avoid mutating the state by reference.
  const newModel = JSON.parse(JSON.stringify(state.model));

  const functionReference = newModel.functions[functionDefIndex];

  const oldCode = codeModelToString(state.model);

  if (input.definition) functionReference.definition = input.definition;
  if (input.parameters) functionReference.parameters = input.parameters;
  if (input.returnType) functionReference.returnType = input.returnType;

  const updatedCode = codeModelToString(newModel);

  if (oldCode === updatedCode) {
    return {
      msg: `Error: This code is the exact same as the previous code! Double check your use of this tool.`,
      model: newModel,
    };
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

  if (result.type === 'success') return { msg: 'success', model: newModel };
  console.error(`Error when compiling: ${result.msg}`);
  return { msg: `Error when compiling: ${result.msg}`, model: newModel };
};

export type UpdateToolParams = z.infer<typeof updateToolSchema>;

const createNewFunctionToolImpl = async (
  input: CreateNewFunctionToolParams,
  state: Task
): Promise<{ msg: string; model: CodeModel }> => {
  const exists =
    state.model.functions.findIndex((func) => func.name === input.name) !== -1;
  if (exists) {
    return {
      msg: `Function name already exists: ${input.name}`,
      model: state.model,
    };
  }

  // Create a deep copy of the current model.
  const newModel = JSON.parse(JSON.stringify(state.model));

  newModel.functions.push({
    ...input,
    parameters: input.parameters ? input.parameters : '',
    definition: input.definition ? input.definition : '',
  });

  const updatedCode = codeModelToString(newModel);
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
  if (result.type === 'success') return { msg: 'success', model: newModel };
  console.error(`Error when compiling: ${result.msg}`);
  return { msg: result.msg, model: newModel };
};

export type DeleteToolParams = z.infer<typeof deleteFunctionToolSchema>;

export const deleteFunctionToolImpl = async (
  input: DeleteToolParams,
  state: Task
): Promise<{ msg: string; model: CodeModel }> => {
  const exists =
    state.model.functions.findIndex(
      (func) => func.name === input.functionName
    ) !== -1;
  if (!exists) {
    return {
      msg: `No such function to delete: ${input.functionName}`,
      model: state.model,
    };
  }

  // Create a deep copy of the current model.
  const newModel: CodeModel = JSON.parse(JSON.stringify(state.model));
  const index = newModel.functions.findIndex(
    (func) => func.name === input.functionName
  );
  newModel.functions.splice(index, 1);

  const updatedCode = codeModelToString(newModel);
  const result = await new Promise<
    { type: 'success' } | { type: 'error'; msg: string }
  >((res) => {
    const error = verifyCode(updatedCode);
    if (error) {
      return res({
        type: 'error',
        msg: `Your action was successful, but the code gave the following error(s). Fix them in the next update: ${error}`,
      });
    }
    emitNewCode(state, updatedCode, res);
  });

  if (result.type === 'success') {
    return { msg: 'success', model: newModel };
  }
  console.error(`Error when compiling: ${result.msg}`);
  return { msg: result.msg, model: newModel };
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
              if (message.id !== genId) {
                state.socket.off('screenshot', handle);
                return;
              }
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
