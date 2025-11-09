import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSettingsStore } from "@/store/useSettingsStore";

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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { theme } = useSettingsStore();

  const effectiveTheme =
    theme === "auto" ? colorScheme : theme === "dark" ? "dark" : "light";

  const paperTheme =
    effectiveTheme === "dark" ? paperDarkTheme : paperLightTheme;
  const navigationTheme = effectiveTheme === "dark" ? DarkTheme : DefaultTheme;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationThemeProvider value={navigationTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style={effectiveTheme === "dark" ? "light" : "dark"} />
      </NavigationThemeProvider>
    </PaperProvider>
  );
}
