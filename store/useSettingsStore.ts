import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SettingsState {
  theme: "light" | "dark" | "auto";
  notificationsEnabled: boolean;
  dailyReminderTime: string; // HH:mm format
  cardsPerSession: number;
  // Actions
  setTheme: (theme: "light" | "dark" | "auto") => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setCardsPerSession: (count: number) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "auto",
      notificationsEnabled: true,
      dailyReminderTime: "09:00",
      cardsPerSession: 10,
      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (enabled) =>
        set({ notificationsEnabled: enabled }),
      setDailyReminderTime: (time) => set({ dailyReminderTime: time }),
      setCardsPerSession: (count) => set({ cardsPerSession: count }),
    }),
    {
      name: "settings-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
