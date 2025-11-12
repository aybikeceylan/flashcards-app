import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "card",
        title: "",
      }}
    >
      <Stack.Screen name="login" options={{ title: "" }} />
      <Stack.Screen name="register" options={{ title: "" }} />
      <Stack.Screen name="forgot-password" options={{ title: "" }} />
      <Stack.Screen name="reset-password" options={{ title: "" }} />
    </Stack>
  );
}
