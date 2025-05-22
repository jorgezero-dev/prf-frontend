import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer"; // Import visualizer

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ open: true, gzipSize: true, brotliSize: true }), // Add visualizer plugin
  ],
});
