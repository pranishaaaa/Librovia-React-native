import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function detectBaseUrl() {
  // Allow overriding with environment variable (if you add one later)
  if (process.env.REACT_NATIVE_API_URL) return process.env.REACT_NATIVE_API_URL;

  // If running on Android emulator (not Expo Go on device), use 10.0.2.2
  if (Platform.OS === "android") return "http://10.0.2.2:8000";

  // Try to infer host IP when running on a physical device via Expo
  try {
    const manifest = Constants.manifest || Constants.expoConfig || {};
    const debuggerHost = manifest.debuggerHost || manifest.hostUri;
    if (debuggerHost) {
      const host = String(debuggerHost).split(":")[0];
      // if host looks like an IP, use that
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        return `http://${host}:8000`;
      }
    }
  } catch (e) {
    // ignore
  }

  // default for web and iOS simulator
  return "http://localhost:8000";
}

const BASE = detectBaseUrl();
const API = axios.create({ baseURL: `${BASE}/api`, timeout: 10000 });

export async function login(email, password) {
  const res = await API.post("/login", { email, password });
  return res.data;
}

export default { login };
