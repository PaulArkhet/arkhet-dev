import { tool } from '@langchain/core/tools';
import type { Socket } from 'socket.io';
import { z } from 'zod';

// const DEFAULT_SIZE = { width: 1900, height: 1000 };

export async function getScreenshot(socket: Socket) {
  return new Promise<string>((res) => {
    socket.emit('get-screenshot', (response: string) => {
      // console.log(response);
      res(response);
    });
  });
}

function clickElement(input: { selector: string }, socket: Socket) {
  return new Promise<string>((res) => {
    socket.emit(
      'click-element',
      input.selector,
      (
        successOrError: { type: 'success' } | { type: 'error'; msg: string }
      ) => {
        if (successOrError.type === 'success') return res('Click success!');
        res(`Click failed: ${successOrError.msg}`);
      }
    );
  });
}

export function generateClickTool(socket: Socket) {
  return tool((input) => clickElement(input, socket), {
    name: 'click',
    description: `
  Click an element on the page based on the selector passed in.
  Use this tool when you wish to test interactions in the app, such as 
  clicking a button, hyperlink, focusing an input field, so on.
  `,
    schema: z.object({
      selector: z.string().describe(`
     A query selector, which will specify which element to click.
        Usage:

        selector: #custom-id -> selects element with "custom-id"
        .customClass -> selects elements with "customClass"
        If multiple elements are found, the first one will be clicked,
        or an error may be thrown. Make sure your selectors are unique!
    `),
    }),
  });
}

export const navigateTool = tool(
  (input: { id: string }) => {
    return input.id;
  },
  {
    name: 'navigate',
    description: `
    Use this tool when you want to see a different wireframe in the app.
    Pass in the unique id of the page you wish to change the view of.
    Navigating to the same page will do nothing, avoid doing so.
    Only navigate to a new page if you need to look at it's corresponding wireframe to formulate your plan.  If you've already looked at all pages,
    DO NOT USE THIS TOOL!`,
    schema: z.object({
      id: z
        .string()
        .describe(`The unique ID of the page, found in the page structure.`),
      notes: z.string()
        .describe(`Information you want to keep regarding the page you just saw. This is a great place for detailed notes, proto-plans or any context
          you find important about the page you just looked at before navigating. 
        `),
    }),
  }
);
