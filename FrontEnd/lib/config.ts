// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://gestpro-backend-production.up.railway.app",
  appName: "GestPro",
  version: "1.0.0",
} as const;
