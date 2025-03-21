import { mightFail } from 'might-fail';
import { genParamsSchema, startGeneration } from '../controllers/ai';
import type { Server } from 'socket.io';

export function attachAIListeners(io: Server) {
  io.on('connection', (socket) => {
    socket.on('trigger-generation', async (incoming: unknown) => {
      const { result: genParams, error } = await mightFail(
        genParamsSchema.parseAsync(incoming)
      );

      if (error) {
        return console.error('genParamsSchema incorrect:', error.message);
      }

      startGeneration(genParams, socket);
    });

    setInterval(() => {
      socket.emit('heartbeat');
    }, 5000);

    socket.on('disconnect', (e) => {
      console.log(`Client ${socket.id} disconnected. Reason: ${e}`);
    });
  });
}
