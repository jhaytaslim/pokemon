import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()], // FIXED: Removed tailwindcss()—use PostCSS instead
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  css: {
    // NEW: Explicit PostCSS config
    postcss: "./postcss.config.cjs",
  },
});
