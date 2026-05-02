export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5005/api";
export const APP_URL = import.meta.env.VITE_APP_URL || "http://localhost:5173";
export const APP_NAME = import.meta.env.VITE_APP_NAME || "SupportBotAI";
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
export const SUPER_ADMIN_EMAIL =
  import.meta.env.VITE_SUPER_ADMIN_EMAIL || "superadmin@gmail.com";
export const IS_DEBUG = import.meta.env.VITE_DEBUG === "true";
export const IS_PRODUCTION = import.meta.env.PROD;
