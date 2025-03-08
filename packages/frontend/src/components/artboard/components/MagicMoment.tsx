import { MutableRefObject, useEffect, useRef, useState } from "react";
import cancelIcon from "/cancel.svg";
import cornerIcon from "/controlcorner.svg";
import {
  getPrototypesByPrototypeIdQueryOptions,
  useUpdatePrototypeMutation,
} from "@/lib/api/prototypes";
import { Socket } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";
import prototypeStore from "@/store/PrototypeStore";
import { PostScreenshotMessage } from "@backend/src/interfaces/ws";
import useMagicMomentStore from "@/store/MagicMomentStore";
import magicMomentPlanet from "/magicmomentplanet.png";
import { addNotification, NotificationItem } from "./AINotifications";

export default function MagicMoment(props: { socket: Socket }) {
  // const { progress, setProgress } = useMagicMomentStore();
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setProgress((prev: number) => (prev < 20 ? prev + 1 : 20));
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, []);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const { notificationItems, setNotificationItems } = useMagicMomentStore();

  const containerRef = useRef<HTMLDivElement>(null);

  async function handleNotificationEvent(notification: NotificationItem) {
    addNotification(notification, setNotificationItems, setNeedsUpdate);
  }

  useEffect(() => setNeedsUpdate(false), [needsUpdate]);

  useEffect(() => {
    props.socket.on("notification", handleNotificationEvent);
    return () => {
      props.socket.off("notification", handleNotificationEvent);
    };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [notificationItems.length]);

  return (
    <div className="arkhet-cursor">
      <div className="pt-[150px] text-center text-4xl font-bold">
        Your prototype is being generated...
      </div>
      <div className="text-center pt-5">
        You may switch to another tab or minimize this window. <br />
        Do not close your browser tab or your work will be lost.
      </div>
      <div className="flex flex-col pt-16 w-[700px] mx-auto">
        <div className="text-xl pb-5 font-bold">Generation history</div>
        <div className="bg-[#242424] p-5">
          <div
            ref={containerRef}
            className="mx-auto h-[300px] overflow-y-auto "
            onWheel={(event) => event.stopPropagation()}
          >
            {notificationItems.map((item) => (
              <div className="py-2">
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="leading-5">{item.body}</p>
              </div>
            ))}
            {/* {Array(20)
            .fill("")
            .map((_, idx) => {
              let bgColor = "#666666"; // Default color

              if (idx < progress) {
                bgColor = "#43EFDB"; // Completed color
              }

              if (idx === progress) {
                bgColor = "#FFFFFF"; // Highlight the rightmost updating tile
              }

              return (
                <div
                  key={idx}
                  className="h-3 w-2 mx-1"
                  style={{ backgroundColor: bgColor }}
                ></div>
              );
            })} */}
          </div>
        </div>
      </div>
    </div>
  );
}
