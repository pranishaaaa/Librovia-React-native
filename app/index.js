import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Delay navigation until after the root navigator has mounted.
    // requestAnimationFrame ensures we run after the first paint; fallback to setTimeout.
    const navigate = () => {
      try {
        router.replace("/login");
      } catch (e) {
        // swallow any early navigation errors and try again shortly
        setTimeout(() => {
          try {
            router.replace("/login");
          } catch (err) {
            // last resort: do nothing
          }
        }, 100);
      }
    };

    let rafId;
    if (typeof requestAnimationFrame === "function") {
      rafId = requestAnimationFrame(navigate);
      return () => cancelAnimationFrame(rafId);
    }

    const id = setTimeout(navigate, 50);
    return () => clearTimeout(id);
  }, [router]);

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
