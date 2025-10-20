/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semi Design primary colors mapped to Tailwind
        primary: 'var(--semi-color-primary, #3B82F6)',
        secondary: 'var(--semi-color-secondary, #6366F1)',
        tertiary: 'var(--semi-color-tertiary, #8B5CF6)',

        // Semi Design semantic colors
        success: 'var(--semi-color-success, #10B981)',
        warning: 'var(--semi-color-warning, #F59E0B)',
        danger: 'var(--semi-color-danger, #EF4444)',
        error: 'var(--semi-color-danger, #EF4444)',
        info: 'var(--semi-color-info, #3B82F6)',

        // Semi Design background colors
        'semi-bg-0': 'var(--semi-color-bg-0, #FFFFFF)',
        'semi-bg-1': 'var(--semi-color-bg-1, #FAFAFA)',
        'semi-bg-2': 'var(--semi-color-bg-2, #F3F4F6)',
        'semi-bg-3': 'var(--semi-color-bg-3, #E5E7EB)',
        'semi-bg-4': 'var(--semi-color-bg-4, #D1D5DB)',

        // Semi Design text colors
        'semi-text-0': 'var(--semi-color-text-0, #111827)',
        'semi-text-1': 'var(--semi-color-text-1, #4B5563)',
        'semi-text-2': 'var(--semi-color-text-2, #6B7280)',
        'semi-text-3': 'var(--semi-color-text-3, #9CA3AF)',

        // Semi Design border colors
        'semi-border': 'var(--semi-color-border, #E5E7EB)',

        // Keep custom colors for non-Semi components
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
      borderRadius: {
        // Semi Design border radius tokens
        'semi-none': 'var(--semi-border-radius-none, 0)',
        'semi-small': 'var(--semi-border-radius-small, 3px)',
        'semi-medium': 'var(--semi-border-radius-medium, 6px)',
        'semi-large': 'var(--semi-border-radius-large, 12px)',
        'semi-full': 'var(--semi-border-radius-full, 9999px)',
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
        'sidebar': '250px',
        'sidebar-collapsed': '64px',
        'tools-panel': '64px',
        'canvas': 'auto',
        'properties-panel': '250px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
