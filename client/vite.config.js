import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL || "http://localhost:5005";
  const isDev = mode === "development";

  return {
    plugins: [react()],
    server: isDev
      ? {
          proxy: {
            "/api": {
              target: apiUrl,
              changeOrigin: true,
              secure: false,
            },
            "/widget.js": {
              target: apiUrl,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,

    build: {
      target: "es2015",
      outDir: "dist",
      minify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (
                id.includes("react") ||
                id.includes("react-dom") ||
                id.includes("react-router-dom")
              ) {
                return "vendor";
              }
              if (
                id.includes("@reduxjs/toolkit") ||
                id.includes("react-redux")
              ) {
                return "redux";
              }
              if (
                id.includes("framer-motion") ||
                id.includes("lucide-react") ||
                id.includes("react-icons") ||
                id.includes("recharts")
              ) {
                return "ui";
              }
              if (id.includes("axios") || id.includes("socket.io-client")) {
                return "network";
              }
              return "deps";
            }
          },
        },
      },
    },

    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
  };
});
