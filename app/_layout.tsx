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
import { useSettingsStore } from "@/store/useSettingsStore";

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
