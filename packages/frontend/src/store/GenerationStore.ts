import { Socket } from "socket.io-client";
import { create } from "zustand";

type GenerationStore = {
  code: string;
  setCode: (code: string) => void;
  socket: Socket | null;
  setSocket: (socket: Socket) => void;
};

export const useGenerationStore = create<GenerationStore>((set) => ({
  code: `
function App() {
    return (
    <div style={{ color: "white", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", }}>
      <h1>The Arkhet AI Team is building your prototype.</h1>
    </div>
  );

}

ReactDOM.render(<App />, document.getElementById('root'));
    `,
  setCode: (code: string) => set({ code }),
  socket: null,
  setSocket: (socket: Socket) => set({ socket }),
}));
