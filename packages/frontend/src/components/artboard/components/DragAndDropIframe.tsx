import {
  MutableRefObject,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import prototypeStore from "@/store/PrototypeStore";
import { Rnd } from "react-rnd";
import { ViewContext } from "../../zoom/ViewContext";
import { LivePreview } from "../../live-preview/LivePreview";
import { Socket } from "socket.io-client";
import type { PostScreenshotMessage } from "@backend/src/interfaces/ws";
import {
  getPrototypesByProjectIdQueryOptions,
  useUpdatePrototypeMutation,
} from "@/lib/api/prototypes";
import { useQuery } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import useMagicMomentStore from "@/store/MagicMomentStore";

export function DragAndDropIframe(props: {
  code: string;
  canvasRef: MutableRefObject<HTMLDivElement | null>;
  isHandToolActive: boolean;
  handleMouseUp: () => void;
  projectId: number;
  socket?: Socket;
}) {
  const { code: initialCode, socket, isHandToolActive, canvasRef } = props;
  const view = useContext(ViewContext);
  const divRef = useRef<HTMLDivElement>(null);
  const { currentPrototype, setIsPrototypeReady, isPrototypeReady } =
    prototypeStore(
      useShallow((state) => ({
        currentPrototype: state.currentPrototype,
        setIsPrototypeReady: state.setIsPrototypeReady,
        isPrototypeReady: state.isPrototypeReady,
      }))
    );

  const { data: prototypesQuery } = useQuery(
    getPrototypesByProjectIdQueryOptions(props.projectId)
  );

  const selectedPrototypeFromQuery = useMemo(
    () =>
      prototypesQuery?.find(
        (prototype) => currentPrototype?.prototypeId === prototype.prototypeId
      ),
    [currentPrototype, prototypesQuery]
  );

  const [code, setCode] = useState<{ code: string; id: number }>({
    code: initialCode,
    id: 0,
  });
  const [needsToUpdatePrototype, setNeedsToUpdatePrototype] = useState(false);
  const { setProgress, setNotificationItems } = useMagicMomentStore();
  const { mutate: updatePrototype, isPending: updatePrototypePending } =
    useUpdatePrototypeMutation();

  function handleUpdatePrototype() {
    if (!currentPrototype) return console.log("no curr prototype!");
    console.log("setting:", code.code);
    if (updatePrototypePending) return;
    updatePrototype({
      param: {
        prototypeId: currentPrototype.prototypeId.toString(),
      },
      json: {
        sourceCode: code.code,
        thumbnailImg: "",
      },
    });
  }

  useEffect(() => {
    if (!needsToUpdatePrototype) return;
    handleUpdatePrototype();
    setNeedsToUpdatePrototype(false);
  }, [needsToUpdatePrototype]);

  useEffect(() => {
    console.log("code updated in effect:", code);
  }, [code]);

  function postScreenshot(message: PostScreenshotMessage) {
    if (!socket) return;
    socket.emit("screenshot", message);
  }

  function setPrototypeReady() {
    console.log("setting prototype to ready...");
    setNeedsToUpdatePrototype(true);
    setTimeout(() => {
      setIsPrototypeReady(true);
    }, 1000);
    setProgress(0);
    setNotificationItems([]);
  }

  useEffect(() => {
    if (!socket) return;
    console.log("attached socket listeneer");
    socket.on("done", setPrototypeReady);
    return () => {
      socket.off("done", setPrototypeReady);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    const handleNewCode = async (
      incomingCode: { code: string; id: number },
      // codeModel: CodeModel, // we need to handle this and save the normalized code model as part of the prototype...
      callback: (
        result: { type: "success" } | { type: "error"; msg: string }
      ) => void
    ) => {
      console.log("incoming,", incomingCode);
      console.log("New valid code received, updating...");
      setCode(incomingCode);
      callback({ type: "success" });
    };
    socket.on("new-code", handleNewCode);
    return () => {
      socket.off("new-code", handleNewCode);
    };
  }, [socket]);

  return (
    <div>
      <Rnd
        enableUserSelectHack={!isHandToolActive}
        enableResizing={!isHandToolActive}
        scale={view ? view.scale : 1}
        size={{
          width: 1200,
          height: 625,
        }}
        default={{
          x: 1300,
          y: 1100,
          width: 1200,
          height: 625,
        }}
        style={{
          position: "absolute",
          cursor: isHandToolActive ? "grab" : "arkhet-cursor",
        }}
        bounds={canvasRef.current ? canvasRef.current : "parent"}
      >
        <div className="h-full relative border arkhet-cursor">
          <LivePreview
            resolveScreenshot={postScreenshot}
            id={code.id}
            code={
              isPrototypeReady
                ? selectedPrototypeFromQuery &&
                  selectedPrototypeFromQuery.sourceCode
                  ? selectedPrototypeFromQuery.sourceCode
                  : code.code
                : code.code
            }
            ref={divRef}
          />
        </div>
      </Rnd>
    </div>
  );
}
