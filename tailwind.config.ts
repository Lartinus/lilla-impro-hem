// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: false,
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        tanker: ['Tanker', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
        satoshi: ['Satoshi', 'sans-serif'],
      },
      fontSize: {
        'base-mobile': '18px',
      },
      borderWidth: {
        '3': '3px',
      },
      colors: {
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },
        // New design system colors
        "primary-red":          "rgb(var(--primary-red))",
        "primary-red-hover":    "rgb(var(--primary-red-hover))",
        "footer-black":         "rgb(var(--footer-black))",
        "card-background":      "rgb(var(--card-background))",
        "background-gray":      "rgb(var(--background-gray))",
        "guest-blue-gray":      "rgb(var(--guest-blue-gray))",
        "text-gray":            "rgb(var(--text-gray))",
        "course-tag-gray":      "rgb(var(--course-tag-gray))",
        "text-black":           "rgb(var(--text-black))",
        "action-blue":          "rgb(var(--action-blue))",
        "action-blue-hover":    "rgb(var(--action-blue-hover))",
        white:                  "rgb(var(--white))",
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
        none: "0px",
        DEFAULT: "10px",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in':       'fade-in 0.6s ease-out',
        float:           'float 3s ease-in-out infinite',
        'slide-in-right':'slide-in-right 0.3s ease-out',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    function({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-hide': {
          /* IE and Edge */
          '-ms-overflow-style': 'none',
          /* Firefox */
          'scrollbar-width':     'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': { display: 'none' },
        }
      });
    }
  ],
} satisfies Config;
