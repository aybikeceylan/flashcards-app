import {
  notificationApi,
  NotificationHistoryParams,
  NotificationHistoryResponse,
  NotificationPreferences,
} from "@/api/client";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Backend formatını frontend formatına çevir
const transformBackendToFrontend = (backend: any): NotificationPreferences => {
  return {
    email: backend.email,
    push: backend.push,
    sms: backend.sms,
    enabled: backend.dailyReminder, // Backend'deki dailyReminder -> enabled
    dailyReminderTime: backend.reminderTime, // Backend'deki reminderTime -> dailyReminderTime
    types: backend.types,
  };
};

// GET /api/notifications/preferences - Kullanıcının notification tercihlerini getir
export const useNotificationPreferences = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<NotificationPreferences>({
    queryKey: ["notification-preferences"],
    queryFn: async () => {
      const response = await notificationApi.getPreferences();
      // Backend formatını frontend formatına çevir
      return transformBackendToFrontend(response.data.data || {});
    },
    enabled: isAuthenticated, // Sadece authenticated kullanıcılar için
    staleTime: 1000 * 60 * 5, // 5 dakika
  });
};

// PUT /api/notifications/preferences - Kullanıcının notification tercihlerini güncelle
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: notificationApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
  });
};

// GET /api/notifications/history - Kullanıcının notification geçmişini getir
export const useNotificationHistory = (params?: NotificationHistoryParams) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<NotificationHistoryResponse>({
    queryKey: ["notification-history", params],
    queryFn: async () => {
      const response = await notificationApi.getHistory(params);
      return (
        response.data.data || {
          currentPage: 1,
          notifications: [],
          totalItems: 0,
          totalPages: 0,
        }
      );
    },
    enabled: isAuthenticated, // Sadece authenticated kullanıcılar için
    staleTime: 1000 * 30, // 30 saniye
  });
};
