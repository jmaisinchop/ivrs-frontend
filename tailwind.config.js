/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      /* ---- COLORES EXISTENTES ---- */
      colors: {
        primary: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        dark: {
          800: "#1e293b",
          900: "#0f172a",
        },

        /* ---- NUEVA PALETA DEL LOGO ---- */
        brand: {
          primary:   "#054F78", // azul petróleo
          secondary: "#4B89C8", // azul medio
          accent:    "#9CB5DF", // azul claro
        },
      },

      /* ---- ANIMACIONES QUE YA TENÍAS ---- */
      animation: {
        "spin-slow":  "spin 2s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4,0,0.6,1) infinite",
      },
    },
  },
  plugins: [],
};
