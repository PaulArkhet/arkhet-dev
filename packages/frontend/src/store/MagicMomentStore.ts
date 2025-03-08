import { NotificationItem } from "@/components/artboard/components/AINotifications";
import { create } from "zustand";

const useMagicMomentStore = create<{
  progress: number;
  setProgress: (progress: number | ((prev: number) => number)) => void;
  notificationItems: NotificationItem[];
  setNotificationItems: (
    items:
      | NotificationItem[]
      | ((prev: NotificationItem[]) => NotificationItem[])
  ) => void;
}>((set) => ({
  progress: 0,
  setProgress: (progress) =>
    set((state) => ({
      progress:
        typeof progress === "function" ? progress(state.progress) : progress,
    })),
  notificationItems: [],
  setNotificationItems: (items) =>
    set((state) => ({
      notificationItems:
        typeof items === "function" ? items(state.notificationItems) : items,
    })),
}));

export default useMagicMomentStore;
