import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Replace the index route with the login screen so signup is not reachable
    router.replace("/login");
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#22c55e" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
  },
});
