import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "./services/authService";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setLoading(false);
      if (data && data.user) {
        try {
          if (data.token) await AsyncStorage.setItem("token", data.token);
          await AsyncStorage.setItem("user", JSON.stringify(data.user));
        } catch (e) {
          console.warn("Failed to persist auth:", e);
        }
        const role = (data.user.role || "").toString().toLowerCase();
        if (role === "librarian") {
          router.push("/dashboard/adminDashboard");
        } else {
          router.push("/dashboard/userDashboard");
        }
      } else {
        Alert.alert("Login failed", data.message || "Unknown error");
      }
    } catch (error) {
      setLoading(false);
      console.warn("Login error", error);
      const message =
        error.response?.data?.message || error.message || "Network error";
      Alert.alert("Login failed", message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading && (
            <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        {/* Removed registration link to show login only */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f6f6f6",
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 24,
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#f9fafb",
    color: "#111827",
  },
  button: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
