import { z } from 'zod';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

export const partialNotificationItemSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export const notificationItemSchema = z
  .object({
    id: z.number(),
    markedForCleanup: z.optional(z.literal(true)),
  })
  .merge(partialNotificationItemSchema);

export type PostScreenshotMessage = {
  type: 'screenshot';
  screenshot: string;
  id: number;
  valid: boolean;
};
