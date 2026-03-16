import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Sitemap from "vite-plugin-sitemap";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
    Sitemap({
      hostname: "https://open-shikomori.github.io",
      outDir: "dist",
      dynamicRoutes: [
        "/#/",
        "/#/about",
        "/#/dataset",
        "/#/roadmap",
        "/#/terms",
        "/#/privacy",
      ],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
