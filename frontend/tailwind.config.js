// import type { Config } from "tailwindcss";

// export default {
//   darkMode: ["class"],
//   content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
//   prefix: "",
//   theme: {
//     container: {
//       center: true,
//       padding: "2rem",
//       screens: {
//         "2xl": "1400px",
//       },
//     },
//     extend: {
//       fontFamily: {
//         sans: ["Space Grotesk", "system-ui", "sans-serif"],
//       },
//       colors: {
//         border: "hsl(var(--border))",
//         input: "hsl(var(--input))",
//         ring: "hsl(var(--ring))",
//         background: "hsl(var(--background))",
//         foreground: "hsl(var(--foreground))",
//         primary: {
//           DEFAULT: "hsl(var(--primary))",
//           foreground: "hsl(var(--primary-foreground))",
//         },
//         secondary: {
//           DEFAULT: "hsl(var(--secondary))",
//           foreground: "hsl(var(--secondary-foreground))",
//         },
//         destructive: {
//           DEFAULT: "hsl(var(--destructive))",
//           foreground: "hsl(var(--destructive-foreground))",
//         },
//         muted: {
//           DEFAULT: "hsl(var(--muted))",
//           foreground: "hsl(var(--muted-foreground))",
//         },
//         accent: {
//           DEFAULT: "hsl(var(--accent))",
//           foreground: "hsl(var(--accent-foreground))",
//         },
//         popover: {
//           DEFAULT: "hsl(var(--popover))",
//           foreground: "hsl(var(--popover-foreground))",
//         },
//         card: {
//           DEFAULT: "hsl(var(--card))",
//           foreground: "hsl(var(--card-foreground))",
//         },
//         glow: {
//           primary: "hsl(var(--glow-primary))",
//           accent: "hsl(var(--glow-accent))",
//         },
//       },
//       borderRadius: {
//         lg: "var(--radius)",
//         md: "calc(var(--radius) - 2px)",
//         sm: "calc(var(--radius) - 4px)",
//       },
//       keyframes: {
//         "accordion-down": {
//           from: { height: "0" },
//           to: { height: "var(--radix-accordion-content-height)" },
//         },
//         "accordion-up": {
//           from: { height: "var(--radix-accordion-content-height)" },
//           to: { height: "0" },
//         },
//         "float": {
//           "0%, 100%": { transform: "translateY(0px)" },
//           "50%": { transform: "translateY(-20px)" },
//         },
//         "pulse-glow": {
//           "0%, 100%": { opacity: "0.5" },
//           "50%": { opacity: "1" },
//         },
//         "morph": {
//           "0%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
//           "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
//           "100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
//         },
//         "spin-slow": {
//           from: { transform: "rotate(0deg)" },
//           to: { transform: "rotate(360deg)" },
//         },
//         "gradient-shift": {
//           "0%, 100%": { backgroundPosition: "0% 50%" },
//           "50%": { backgroundPosition: "100% 50%" },
//         },
//         "glitch": {
//           "0%": { transform: "translate(0)" },
//           "20%": { transform: "translate(-2px, 2px)" },
//           "40%": { transform: "translate(-2px, -2px)" },
//           "60%": { transform: "translate(2px, 2px)" },
//           "80%": { transform: "translate(2px, -2px)" },
//           "100%": { transform: "translate(0)" },
//         },
//         "slide-up": {
//           from: { opacity: "0", transform: "translateY(30px)" },
//           to: { opacity: "1", transform: "translateY(0)" },
//         },
//         "slide-down": {
//           from: { opacity: "0", transform: "translateY(-30px)" },
//           to: { opacity: "1", transform: "translateY(0)" },
//         },
//         "scale-in": {
//           from: { opacity: "0", transform: "scale(0.9)" },
//           to: { opacity: "1", transform: "scale(1)" },
//         },
//         "fade-in": {
//           from: { opacity: "0" },
//           to: { opacity: "1" },
//         },
//         "blob": {
//           "0%": { transform: "translate(0px, 0px) scale(1)" },
//           "33%": { transform: "translate(30px, -50px) scale(1.1)" },
//           "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
//           "100%": { transform: "translate(0px, 0px) scale(1)" },
//         },
//       },
//       animation: {
//         "accordion-down": "accordion-down 0.2s ease-out",
//         "accordion-up": "accordion-up 0.2s ease-out",
//         "float": "float 6s ease-in-out infinite",
//         "pulse-glow": "pulse-glow 2s ease-in-out infinite",
//         "morph": "morph 8s ease-in-out infinite",
//         "spin-slow": "spin-slow 20s linear infinite",
//         "gradient-shift": "gradient-shift 3s ease infinite",
//         "glitch": "glitch 0.3s ease-in-out",
//         "slide-up": "slide-up 0.6s ease-out forwards",
//         "slide-down": "slide-down 0.6s ease-out forwards",
//         "scale-in": "scale-in 0.5s ease-out forwards",
//         "fade-in": "fade-in 0.5s ease-out forwards",
//         "blob": "blob 7s infinite",
//       },
//       backgroundImage: {
//         "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
//         "hero-gradient": "var(--gradient-hero)",
//         "glow-gradient": "var(--gradient-glow)",
//       },
//     },
//   },
//   plugins: [require("tailwindcss-animate")],
// } satisfies Config;


/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // your source files
    "./public/index.html",         // or your index.html
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
      fontFamily: {
        sans: ["Space Grotesk", "system-ui", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glow: {
          primary: "hsl(var(--glow-primary))",
          accent: "hsl(var(--glow-accent))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.5" },
          "50%": { opacity: "1" },
        },
        morph: {
          "0%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
          "50%": { borderRadius: "30% 60% 70% 40% / 50% 60% 30% 60%" },
          "100%": { borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        glitch: {
          "0%": { transform: "translate(0)" },
          "20%": { transform: "translate(-2px, 2px)" },
          "40%": { transform: "translate(-2px, -2px)" },
          "60%": { transform: "translate(2px, 2px)" },
          "80%": { transform: "translate(2px, -2px)" },
          "100%": { transform: "translate(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-30px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        morph: "morph 8s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        glitch: "glitch 0.3s ease-in-out",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "slide-down": "slide-down 0.6s ease-out forwards",
        "scale-in": "scale-in 0.5s ease-out forwards",
        "fade-in": "fade-in 0.5s ease-out forwards",
        blob: "blob 7s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient": "var(--gradient-hero)",
        "glow-gradient": "var(--gradient-glow)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
