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
  setNotificationItems: React.Dispatch<
    React.SetStateAction<NotificationItem[]>
  >,
  setNeedsUpdate: React.Dispatch<React.SetStateAction<boolean>>
) {
  setNotificationItems((notificationItems) => {
    const exists = notificationItems.some(
      (notificationItem) => notificationItem.id === notification.id
    );
    if (exists) return notificationItems;

    notificationItems.push(notification);
    setNeedsUpdate(true);
    return notificationItems;
  });
}

export function AINotifications(props: { socket: Socket }) {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [notificationItems, setNotificationItems] = useState<
    NotificationItem[]
  >([]);

  async function handleNotificationEvent(notification: NotificationItem) {
    // console.log("incoming notif: " + JSON.stringify(notification, null, 2));

    addNotification(notification, setNotificationItems, setNeedsUpdate);

    // mark for deletion (for animation (opacity toggle) purposes)
    setTimeout(() => {
      setNotificationItems((notificationItems) => {
        const notificationToMarkIndex = notificationItems.findIndex(
          (notificationItem) => notification.id === notificationItem.id
        );
        if (notificationToMarkIndex === -1) return notificationItems;
        notificationItems[notificationToMarkIndex].markedForCleanup = true;
        setNeedsUpdate(true);

        // remove notif completely after timeout
        setTimeout(() => deleteNotificationById(notification.id), 400);

        return notificationItems;
      });
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
