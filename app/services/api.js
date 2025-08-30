import axios from "axios";
import { Platform } from "react-native";
import Constants from "expo-constants";

function detectBaseUrl() {
  if (process.env.REACT_NATIVE_API_URL) return process.env.REACT_NATIVE_API_URL;
  if (Platform.OS === "android") return "http://10.0.2.2:8000";
  try {
    const manifest = Constants.manifest || Constants.expoConfig || {};
    const debuggerHost = manifest.debuggerHost || manifest.hostUri;
    if (debuggerHost) {
      const host = String(debuggerHost).split(":")[0];
      if (host && host !== "localhost" && host !== "127.0.0.1") {
        return `http://${host}:8000`;
      }
    }
  } catch (e) {}
  return (
    process.env.REACT_NATIVE_API_URL || "https://librovia-backend.onrender.com"
  );
}

export const BASE = detectBaseUrl();
export const API = axios.create({ baseURL: `${BASE}/api`, timeout: 30000 });

export default API;
