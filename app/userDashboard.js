import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function UserDashboard() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to the User Dashboard!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
});
