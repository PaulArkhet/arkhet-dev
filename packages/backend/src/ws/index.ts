import type { Server } from "socket.io";
import { attachAIListeners } from "./ai";

export function attachSocketEventListeners(io: Server) {
  attachAIListeners(io);
}
