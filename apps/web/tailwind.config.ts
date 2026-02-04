import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // AODI Brand Colors
        'aodi-green': {
          DEFAULT: '#0F3D2E',
          50: '#E8F5F0',
          100: '#D1EBE1',
          200: '#A3D7C3',
          300: '#75C3A5',
          400: '#47AF87',
          500: '#1F7A6E',
          600: '#0F3D2E',
          700: '#0C3124',
          800: '#09251B',
          900: '#061912',
        },
        'aodi-teal': {
          DEFAULT: '#1F7A6E',
          50: '#E6F4F2',
          100: '#CCE9E5',
          200: '#99D3CB',
          300: '#66BDB1',
          400: '#33A797',
          500: '#1F7A6E',
          600: '#196258',
          700: '#134A42',
          800: '#0C312C',
          900: '#061916',
        },
        'aodi-gold': {
          DEFAULT: '#C9A24D',
          50: '#FCF8EF',
          100: '#F9F1DF',
          200: '#F3E3BF',
          300: '#EDD59F',
          400: '#E7C77F',
          500: '#C9A24D',
          600: '#A1823E',
          700: '#79612E',
          800: '#51411F',
          900: '#28200F',
        },
        // Neutral Foundation
        'charcoal': '#1F2933',
        'slate': '#6B7280',
        'soft-grey': '#F5F7F9',
        // Semantic colors
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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
