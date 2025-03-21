import { useEffect, useRef, forwardRef, MutableRefObject } from "react";
import * as Babel from "@babel/standalone";
import { PostScreenshotMessage } from "@backend/src/interfaces/ws";

export const LivePreview = forwardRef<
  HTMLDivElement,
  {
    code: string;
    resolveScreenshot?: (message: PostScreenshotMessage) => void;
    id?: number;
  }
>((props, ref) => {
  const internalRef = useRef<HTMLIFrameElement>(null);
  const divRef = useRef<HTMLDivElement>(null);

  // Sync the forwarded ref with the internal ref
  useEffect(() => {
    if (typeof ref === "function") {
      ref(divRef.current);
    } else if (ref && typeof ref === "object") {
      (ref as MutableRefObject<HTMLDivElement | null>).current = divRef.current;
    }
  }, [ref]);

  function getIframeDoc(code: string) {
    try {
      return transpileCode(code, props.id ? props.id : 0);
    } catch (err) {
      return `<pre style="color: red;">${(err as Error).message}</pre>`;
    }
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === "error") {
        console.error("Iframe error:", event.data.message);
        // You can also set state or dispatch actions as needed
      }
      if (event.data && event.data.type === "screenshot") {
        console.log("received message from iframe:", event.data);
        props.resolveScreenshot &&
          props.resolveScreenshot({
            screenshot: event.data.screenshot,
            id: event.data.id,
            type: "screenshot",
            valid: event.data.valid,
          });
      }
    }

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <div className="h-full w-full" ref={divRef}>
      <iframe
        srcDoc={getIframeDoc(props.code)}
        title="Live Preview"
        ref={internalRef}
        sandbox="allow-scripts allow-same-origin"
        style={{ width: "100%", height: "100%", border: "none" }}
      />
    </div>
  );
});

export function transpileCode(code: string, id: number) {
  const transpiledCode = Babel.transform(code, {
    presets: ["react", "env", "typescript"],
    filename: "main.tsx",
  }).code;

  return `
            <html>
              <head>
                <meta charset="UTF-8" />
                <title>Live Preview</title>
                <style>body { font-family: Arial, sans-serif; padding: 0; margin: 0; }</style>
                <script src="https://cdn.tailwindcss.com"></script>
                <meta HTTP-EQUIV="Access-Control-Allow-Origin" content="https://unpkg.com">
              </head>
              <body>
                <div id="root"></div>
                <script src="https://unpkg.com/react@17/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/modern-screenshot"></script>
                <script>
                  try {
                    ${transpiledCode}

                    setTimeout(() => {
                      const root = document.querySelector("#root")
                      const screenshot = modernScreenshot.domToPng(root)
                      screenshot.then(screenshot => {
                        if (root.innerHTML === "") {
                          window.parent.postMessage({ type: "screenshot", screenshot, id: ${id}, valid: false })
                        } else {
                          window.parent.postMessage({ type: "screenshot", screenshot, id: ${id}, valid: true })
                          }
                      });
                    }, 2000)
                  } catch (err) {
                    const errorDiv = iframeDocument.createElement('div');
                    errorDiv.style.color = 'red';
                    errorDiv.innerText = err;
                    iframeDocument.body.appendChild(errorDiv);
                    window.parent.postMessage({ type: 'error', message: err.toString()})
                  }
                  window.addEventListener('wheel', (e) => {
                    if (e.ctrlKey) {
                        e.preventDefault();
                    }
                  }, { passive: false });
                </script>
              </body>
            </html>
    `;
}
