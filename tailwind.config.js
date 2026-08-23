/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(215 15% 22%)",
        input: "hsl(215 15% 22%)",
        ring: "hsl(212 100% 65%)",
        background: "hsl(220 13% 8%)",
        foreground: "hsl(220 13% 95%)",
        primary: {
          DEFAULT: "hsl(212 100% 65%)",
          foreground: "hsl(220 13% 8%)",
        },
        secondary: {
          DEFAULT: "hsl(220 13% 16%)",
          foreground: "hsl(220 13% 95%)",
        },
        muted: {
          DEFAULT: "hsl(220 13% 14%)",
          foreground: "hsl(220 8% 60%)",
        },
        accent: {
          DEFAULT: "hsl(220 13% 16%)",
          foreground: "hsl(212 100% 65%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84% 60%)",
          foreground: "hsl(220 13% 95%)",
        },
        card: {
          DEFAULT: "hsl(220 13% 11%)",
          foreground: "hsl(220 13% 95%)",
        },
        success: "hsl(142 71% 45%)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
