import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Removed as Tailwind CSS v4 handles PostCSS internally

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], // Removed tailwindcss() from plugins
});
