import { mightFail } from "might-fail";
import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { notificationItemSchema } from "@backend/src/interfaces/ws";

const NOTIFICATION_TIMEOUT_MILLISECONDS = 25_000;

export type NotificationItem = z.infer<typeof notificationItemSchema>;

export function addNotification(
  notification: NotificationItem,
  setNotificationItems: (
    updater:
      | NotificationItem[]
      | ((prev: NotificationItem[]) => NotificationItem[])
  ) => void,
  setNeedsUpdate: React.Dispatch<React.SetStateAction<boolean>>
) {
  setNotificationItems((prev) => {
    if (prev.some((item) => item.id === notification.id)) {
      return prev; // Avoid duplicates
    }
    return [...prev, notification]; // Immutable update
  });

  setNeedsUpdate(true);
}

export function AINotifications(props: { socket: Socket }) {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [notificationItems, setNotificationItems] = useState<
    NotificationItem[]
  >([]);

  async function handleNotificationEvent(notification: NotificationItem) {
    addNotification(notification, setNotificationItems, setNeedsUpdate);

    setTimeout(() => {
      setNotificationItems((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, markedForCleanup: true }
            : item
        )
      );

      setNeedsUpdate(true);

      setTimeout(() => deleteNotificationById(notification.id), 400);
    }, NOTIFICATION_TIMEOUT_MILLISECONDS);
  }

  useEffect(() => setNeedsUpdate(false), [needsUpdate]);

  function deleteNotificationById(id: number) {
    setNotificationItems((notificationItems) => {
      const notificationToRemoveIndex = notificationItems.findIndex(
        (notificationItem) => id === notificationItem.id
      );
      if (notificationToRemoveIndex === -1) return notificationItems;
      setNeedsUpdate(true);

      return notificationItems.toSpliced(notificationToRemoveIndex, 1);
    });
  }

  useEffect(() => {
    props.socket.on("notification", handleNotificationEvent);
    return () => {
      props.socket.off("notification", handleNotificationEvent);
    };
  }, []);

  return (
    <div
      className="flex flex-col gap-2 absolute bottom-0 right-60 mb-5 mr-10 border-red-500 z-50"
      id="notif"
    >
      {notificationItems.map((item) => (
        <div
          key={item.id}
          onClick={() => deleteNotificationById(item.id)}
          className={twMerge(
            "bg-[#1A1A1A] drop-shadow-lg transition-opacity duration-200 p-4 px-8 max-w-80 flex flex-col gap-1 rounded hover:opacity-80 hover:transition-none cursor-pointer",
            item.markedForCleanup ? "opacity-0" : "opacity-100"
          )}
        >
          <h3 className="font-semibold text-lg">{item.title}</h3>
          <p className="leading-5">{item.body}</p>
        </div>
      ))}
    </div>
  );
}
