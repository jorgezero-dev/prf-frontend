/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class", // or 'media' if you prefer OS-level dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#67e8f9", // Light cyan
          DEFAULT: "#06b6d4", // Default cyan
          dark: "#0e7490", // Dark cyan
        },
        secondary: {
          light: "#fca5a5", // Light red
          DEFAULT: "#f87171", // Default red
          dark: "#b91c1c", // Dark red
        },
        accent: {
          light: "#fde047", // Light yellow
          DEFAULT: "#facc15", // Default yellow
          dark: "#a16207", // Dark yellow
        },
        // New Neutral Palette (Cool Grays - e.g., Slate-like)
        neutral: {
          50: "#F8FAFC", // Almost white, for subtle backgrounds or borders
          100: "#F1F5F9", // Very light gray, for UI elements, hover states
          200: "#E2E8F0", // Light gray, for UI elements, borders
          300: "#CBD5E1", // Soft medium gray, for less important text, borders
          400: "#94A3B8", // Medium gray, for secondary text, icons
          500: "#64748B", // Default gray, for general purpose
          600: "#475569", // Dark medium gray, for hover states in dark mode, subtle text
          700: "#334155", // Dark gray, for secondary text (light mode), backgrounds (dark mode)
          800: "#1E293B", // Very dark gray, for backgrounds (dark mode), text (light mode)
          900: "#0F172A", // Deepest gray, for main background (dark mode), primary text (light mode)
        },
        // Updated Background and Text colors using the new neutral palette
        background: {
          light: "#FFFFFF", // Pure white for light mode main background
          dark: "#0F172A", // neutral-900 for dark mode main background
          lightElevated: "#F8FAFC", // neutral-50 for elevated surfaces in light mode (e.g., cards)
          darkElevated: "#1E293B", // neutral-800 for elevated surfaces in dark mode
        },
        text: {
          // For primary text content
          lightMode: "#0F172A", // neutral-900 for text on light backgrounds
          darkMode: "#F1F5F9", // neutral-100 for text on dark backgrounds
          // For secondary/subtle text
          lightModeSecondary: "#334155", // neutral-700
          darkModeSecondary: "#94A3B8", // neutral-400
          // For text on primary/accent colors (ensure contrast)
          onPrimary: "#FFFFFF",
          onAccent: "#1E293B",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"], // Example serif font
      },
      // Add custom animations, transitions, or other theme extensions here
      // Example:
      // animation: {
      //   'fade-in': 'fadeIn 0.5s ease-out',
      // },
      // keyframes: {
      //   fadeIn: {
      //     '0%': { opacity: '0' },
      //     '100%': { opacity: '1' },
      //   },
      // },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), // If you want rich text styling
    // require('@tailwindcss/forms'),    // If you want pre-styled form elements
  ],
  // DaisyUI configuration removed
};
