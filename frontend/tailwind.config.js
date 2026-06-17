/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        canvas: {
          light: "#F4FBF7",
          dark: "#0F1F13",
        },
        cardbg: {
          light: "#FFFFFF",
          dark: "#1B3020",
        },
        text: {
          primary: {
            light: "#1A301D",
            dark: "#ECFDF5",
          },
          muted: {
            light: "#5E7A62",
            dark: "#8CA991",
          },
        },
        primaryGreen: {
          DEFAULT: "#58CC02",
          shadow: "#3A9E01",
          dark: "#6EE7B7",
          darkShadow: "#065F46",
        },
        rewardGold: {
          DEFAULT: "#FFB000",
          shadow: "#D88D00",
          dark: "#FFC000",
          darkShadow: "#9A6A00",
        },
        waterBlue: {
          light: "#0EA5E9",
          dark: "#38BDF8",
        },
        dangerRed: {
          light: "#FF4B4B",
          dark: "#FCA5A5",
        },
        border: {
          light: "#C3DEC9",
          dark: "#1B3020",
        },
      },
      borderRadius: {
        card: "16px",
        button: "9999px",
      },
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      boxShadow: {
        "tactile-card": "0px 4px 0px #E2F2E7",
        "tactile-card-hover": "0px 6px 0px #E2F2E7",
        "tactile-green": "0px 4px 0px #3A9E01",
        "tactile-gold": "0px 4px 0px #D88D00",
        "tactile-green-dark": "0px 4px 0px #065F46",
        "tactile-gold-dark": "0px 4px 0px #9A6A00",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
