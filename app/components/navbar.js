import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

export default function Navbar() {
  const router = useRouter();

  return (
    <View style={styles.nav}>
      <TouchableOpacity style={styles.brand} onPress={() => router.push("/")}>
        <Image source={require("../../assets/logo.jpg")} style={styles.logo} />
        <Text style={styles.title}>Librovia</Text>
      </TouchableOpacity>

      <View style={styles.right}>
        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push("/dashboard/userDashboard")}
        >
          <Text style={styles.linkText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    height: 56,
    paddingHorizontal: 12,
    backgroundColor: "#16a34a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 60,
  },
  brand: { flexDirection: "row", alignItems: "center" },
  logo: { width: 36, height: 36, borderRadius: 18 },
  title: { color: "#fff", fontWeight: "700", fontSize: 16, marginLeft: 10 },
  right: { flexDirection: "row", alignItems: "center" },
  link: { marginRight: 12 },
  linkText: { color: "#fff", fontWeight: "600" },
  themeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  themeText: { color: "#fff" },
});
