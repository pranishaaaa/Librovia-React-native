import { Stack } from "expo-router";
import "../global.css";
import { Platform, StyleSheet } from "react-native";

// Enable class-based dark mode on web to avoid runtime errors from libraries
if (Platform.OS === "web") {
  try {
    StyleSheet.setFlag && StyleSheet.setFlag("darkMode", "class");
  } catch (e) {
    // ignore
  }
}

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="dashboard/adminDashboard" />
      <Stack.Screen name="dashboard/userDashboard" />
    </Stack>
  );
}
