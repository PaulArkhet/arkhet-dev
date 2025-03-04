import { mightFail } from "might-fail";
import { genParamsSchema, startGeneration } from "../controllers/ai";
import type { Server } from "socket.io";

export function attachAIListeners(io: Server) {
  io.on("connection", (socket) => {
    socket.on("trigger-generation", async (incoming: unknown) => {
      const { result: genParams, error } = await mightFail(
        genParamsSchema.parseAsync(incoming)
      );

      if (error) {
        return console.error("genParamsSchema incorrect:", error.message);
      }

      startGeneration(genParams, socket);
    });

    socket.on("disconnect", () => {
      console.log(`Client ${socket.id} disconnected.`);
    });
  });
}
