import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TouchableOpacity } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFCMToken } from "@/hooks/useFCMToken";
import { notificationService } from "@/services/notificationService";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useEffect } from "react";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 dakika
      gcTime: 1000 * 60 * 10, // 10 dakika
    },
  },
});

export const unstable_settings = {
  anchor: "(tabs)",
};

// React Native Paper theme with custom colors
const paperLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200ee",
    secondary: "#03dac4",
    background: "#f5f5f5",
    surface: "#ffffff",
    error: "#b00020",
  },
};

const paperDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#bb86fc",
    secondary: "#03dac4",
    background: "#121212",
    surface: "#1e1e1e",
    error: "#cf6679",
  },
};

function CustomBackButton() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { theme } = useSettingsStore();

  const effectiveTheme =
    theme === "auto" ? colorScheme : theme === "dark" ? "dark" : "light";

  const iconColor = effectiveTheme === "dark" ? "#fff" : "#000";

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      style={{ marginLeft: 8, marginRight: 10 }}
    >
      <Ionicons name="arrow-back" size={24} color={iconColor} />
    </TouchableOpacity>
  );
}

// Component to initialize FCM token and notifications inside QueryClientProvider
function NotificationInitializer() {
  const router = useRouter();

  // Initialize FCM token management (must be inside QueryClientProvider)
  useFCMToken();

  // Setup notification listeners
  useEffect(() => {
    try {
      notificationService.setupNotificationListeners({
        onNotificationReceived: (notification) => {
          try {
            console.log("📬 Notification received:", notification);
            // Handle foreground notifications if needed
          } catch (error) {
            console.error("Error handling notification:", error);
          }
        },
        onNotificationTapped: (response) => {
          try {
            console.log("👆 Notification tapped:", response);
            const data = response?.notification?.request?.content?.data;
            // Navigate based on notification data if needed
            if (data?.screen && router) {
              router.push(data.screen as any);
            }
          } catch (error) {
            console.error("Error handling notification tap:", error);
          }
        },
      });
    } catch (error) {
      console.error("Error setting up notification listeners:", error);
    }

    return () => {
      try {
        notificationService.removeNotificationListeners();
      } catch (error) {
        console.error("Error cleaning up notification listeners:", error);
      }
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useSettingsStore();

  const effectiveTheme =
    theme === "auto" ? colorScheme : theme === "dark" ? "dark" : "light";

  const paperTheme =
    effectiveTheme === "dark" ? paperDarkTheme : paperLightTheme;
  const navigationTheme = effectiveTheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationInitializer />
      <PaperProvider theme={paperTheme}>
        <NavigationThemeProvider value={navigationTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="modal"
              options={{ presentation: "modal", title: "Yeni Kart Ekle" }}
            />
            <Stack.Screen
              name="flashcard-detail"
              options={{
                title: "Kart Detayı",
                headerBackTitle: "",
                headerLeft: () => <CustomBackButton />,
              }}
            />
            <Stack.Screen
              name="edit-flashcard"
              options={{
                title: "Kartı Düzenle",
                headerBackTitle: "",
                headerLeft: () => <CustomBackButton />,
              }}
            />
          </Stack>
          <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
        </NavigationThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
