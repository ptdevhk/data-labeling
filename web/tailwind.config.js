/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Light mode colors
        primary: '#3B82F6',
        success: '#10B981',
        error: '#EF4444',
        neutral: '#F3F4F6',
        text: {
          light: '#111827',
          dark: '#F9FAFB',
        },
        bg: {
          light: '#FFFFFF',
          dark: '#111827',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
      },
      fontSize: {
        'h1': '32px',
        'h2': '24px',
        'body': '16px',
        'caption': '14px',
      },
      spacing: {
        'sidebar': '20%',
        'sidebar-collapsed': '60px',
        'tools-panel': '15%',
        'canvas': '70%',
        'properties-panel': '15%',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
