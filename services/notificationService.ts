import { notificationApi } from "@/api/client";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Check if running in Expo Go (limited notification support)
// Expo Go has limited push notification support in SDK 53+
const isExpoGo =
  Constants.executionEnvironment === "storeClient" ||
  Constants.appOwnership === "expo";

// Notification handler configuration - only set if not in Expo Go
if (!isExpoGo) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });
  } catch (error) {
    console.warn("Failed to set notification handler:", error);
  }
}

export interface NotificationServiceConfig {
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationTapped?: (
    notification: Notifications.NotificationResponse
  ) => void;
}

class NotificationService {
  private expoPushToken: string | null = null;
  private notificationListener: Notifications.Subscription | null = null;
  private responseListener: Notifications.Subscription | null = null;

  /**
   * Check if notifications are supported
   */
  private isNotificationSupported(): boolean {
    if (isExpoGo) {
      console.warn(
        "Push notifications have limited support in Expo Go. Use a development build for full functionality."
      );
      return false;
    }
    return true;
  }

  /**
   * Check notification permission status
   */
  async getPermissionStatus(): Promise<Notifications.NotificationPermissionsStatus | null> {
    if (!this.isNotificationSupported()) {
      return null;
    }
    try {
      return await Notifications.getPermissionsAsync();
    } catch (error) {
      console.error("Error getting notification permissions:", error);
      return null;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!this.isNotificationSupported()) {
      console.warn("Notifications not supported in Expo Go");
      return false;
    }
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permissions not granted");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Get Expo Push Token (FCM token for Android, APNs token for iOS)
   */
  async getExpoPushToken(): Promise<string | null> {
    if (!this.isNotificationSupported()) {
      console.warn("Cannot get push token in Expo Go");
      return null;
    }
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // For Android, we need to configure the notification channel
      if (Platform.OS === "android") {
        try {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
          });
        } catch (error) {
          console.warn("Failed to set notification channel:", error);
        }
      }

      // Get project ID from Constants or environment variable
      const projectId =
        process.env.EXPO_PUBLIC_PROJECT_ID ||
        Constants.expoConfig?.extra?.eas?.projectId;

      if (!projectId) {
        const errorMessage =
          "Project ID not found. Please set EXPO_PUBLIC_PROJECT_ID or configure EAS project ID in app.json";
        console.warn(errorMessage);
        return null; // Return null instead of throwing
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId as string,
      });

      if (tokenData?.data) {
        this.expoPushToken = tokenData.data;
        return this.expoPushToken;
      }
      return null;
    } catch (error) {
      console.error("Error getting Expo push token:", error);
      return null;
    }
  }

  /**
   * Register FCM token with backend
   */
  async registerToken(token: string): Promise<boolean> {
    try {
      await notificationApi.saveFCMToken(token);
      console.log("FCM token registered successfully");
      return true;
    } catch (error) {
      console.error("Error registering FCM token:", error);
      return false;
    }
  }

  /**
   * Unregister FCM token from backend
   */
  async unregisterToken(token: string): Promise<boolean> {
    try {
      await notificationApi.deleteFCMToken(token);
      console.log("FCM token unregistered successfully");
      return true;
    } catch (error) {
      console.error("Error unregistering FCM token:", error);
      return false;
    }
  }

  /**
   * Initialize notification listeners
   */
  setupNotificationListeners(config?: NotificationServiceConfig) {
    if (!this.isNotificationSupported()) {
      console.warn("Notification listeners not supported in Expo Go");
      return;
    }

    try {
      // Clean up existing listeners first
      this.removeNotificationListeners();

      // Listener for notifications received while app is foregrounded
      this.notificationListener = Notifications.addNotificationReceivedListener(
        (notification) => {
          try {
            console.log("📬 Notification received:", notification);
            config?.onNotificationReceived?.(notification);
          } catch (error) {
            console.error("Error in notification received handler:", error);
          }
        }
      );

      // Listener for when user taps on a notification
      this.responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          try {
            console.log("👆 Notification tapped:", response);
            config?.onNotificationTapped?.(response);
          } catch (error) {
            console.error("Error in notification tapped handler:", error);
          }
        });
    } catch (error) {
      console.error("Error setting up notification listeners:", error);
    }
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    try {
      if (this.notificationListener) {
        try {
          // Expo Notifications API - subscription.remove() kullan
          if (typeof this.notificationListener.remove === "function") {
            this.notificationListener.remove();
          }
        } catch (error) {
          console.warn("Error removing notification listener:", error);
        }
        this.notificationListener = null;
      }
      if (this.responseListener) {
        try {
          // Expo Notifications API - subscription.remove() kullan
          if (typeof this.responseListener.remove === "function") {
            this.responseListener.remove();
          }
        } catch (error) {
          console.warn("Error removing response listener:", error);
        }
        this.responseListener = null;
      }
    } catch (error) {
      console.error("Error in removeNotificationListeners:", error);
    }
  }

  /**
   * Get current Expo push token
   */
  getCurrentToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Cancel a specific notification by identifier
   */
  async cancelNotification(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Get all scheduled notifications
   */
  async getScheduledNotifications(): Promise<
    Notifications.NotificationRequest[]
  > {
    return await Notifications.getAllScheduledNotificationsAsync();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
