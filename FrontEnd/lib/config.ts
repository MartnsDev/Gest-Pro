// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  appName: "GestPro",
  version: "1.0.0",
} as const;
