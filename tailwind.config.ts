
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
      'tanker': ['Tanker', 'sans-serif'],
      'rajdhani': ['Rajdhani', 'sans-serif'],
      'satoshi': ['Satoshi', 'sans-serif'],
    },
      fontSize: {
        'base-mobile': '18px',
      },
      borderWidth: {
        '3': '3px',
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // New design system colors
        "primary-red": "hsl(var(--primary-red))",
        "primary-red-hover": "hsl(var(--primary-red-hover))",
        "footer-black": "hsl(var(--footer-black))",
        "card-background": "hsl(var(--card-background))",
        "background-gray": "hsl(var(--background-gray))",
        "guest-blue-gray": "hsl(var(--guest-blue-gray))",
        "text-gray": "hsl(var(--text-gray))",
        "course-tag-gray": "hsl(var(--course-tag-gray))",
        "text-black": "hsl(var(--text-black))",
        "action-blue": "hsl(var(--action-blue))",
        "action-blue-hover": "hsl(var(--action-blue-hover))",
        "white": "hsl(var(--white))",
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
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.6s ease-out',
        float: 'float 3s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
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
          'scrollbar-width': 'none',
          /* Safari and Chrome */
          '&::-webkit-scrollbar': {
            display: 'none'
          }
        }
      })
    }
  ],
} satisfies Config;
