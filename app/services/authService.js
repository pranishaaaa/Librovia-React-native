import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function detectBaseUrl() {
  // Allow overriding with environment variable
  if (process.env.REACT_NATIVE_API_URL) return process.env.REACT_NATIVE_API_URL;

  // If running on Android emulator (not Expo Go on device), use 10.0.2.2 for local dev
  if (Platform.OS === "android") return "http://10.0.2.2:8000";

  // Try to infer host IP when running on a physical device via Expo
  try {
    const manifest = Constants.manifest || Constants.expoConfig || {};
    const debuggerHost = manifest.debuggerHost || manifest.hostUri;
    if (debuggerHost) {
      const host = String(debuggerHost).split(":")[0];
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        return `http://${host}:8000`;
      }
    }
  } catch (e) {
    // ignore
  }

  // Use the hosted Render backend by default for web and iOS simulators
  return (
    process.env.REACT_NATIVE_API_URL ||
    "https://librovia-backend.onrender.com/api"
  );
}

const BASE = detectBaseUrl();
// detectBaseUrl() already returns a URL that includes the /api suffix for the hosted render
// backend (or an env/host-derived base). Use it directly as the axios baseURL so we don't
// accidentally produce a double "/api/api" path.
const API = axios.create({ baseURL: BASE, timeout: 30000 });

export async function login(email, password) {
  const res = await API.post("/login", { email, password });
  return res.data;
}

export default { login };
