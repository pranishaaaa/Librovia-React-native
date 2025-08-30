// Ensure the StyleSheet darkMode flag is set early on web to avoid runtime
// errors from libraries that attempt to change the color scheme before
// we configure it. Use runtime require so this runs before other imports.
try {
  const { Platform, StyleSheet } = require("react-native");
  if (Platform && Platform.OS === "web") {
    try {
      StyleSheet.setFlag && StyleSheet.setFlag("darkMode", "class");
    } catch (e) {
      // ignore
    }
  }
} catch (e) {
  // ignore if react-native isn't available yet
}

import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
