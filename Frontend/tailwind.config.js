/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2.5rem',
        xl: '4rem',
        '2xl': '4rem',
      },
    },
    extend: {
      colors: {
        // Warm surfaces
        'cream': '#FDF6EC',
        'surface': '#FFFFFF',
        'surface-warm': '#FFF4E6',
        'surface-deep': '#FDE4C8',
        'border-warm': '#F0DFC5',
        'border-soft': '#E8D5B8',

        // Deep brown (headings, footer)
        'brown': {
          DEFAULT: '#3D1A00',
          deep: '#2B0F00',
          body: '#5C4B3A',
          muted: '#7A6A5A',
          soft: '#A8998A',
        },

        // Brand (blue - keep)
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },

        // Accent (orange - main CTA)
        accent: {
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FDE4C8',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#F15A29',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },

        // Status
        'success': '#16A34A',
        'warning': '#F59E0B',
        'danger': '#DC2626',
        'info': '#0EA5E9',
      },

      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },

      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },

      boxShadow: {
        'soft': '0 1px 2px rgba(61, 26, 0, 0.04), 0 1px 3px rgba(61, 26, 0, 0.06)',
        'card': '0 2px 4px rgba(61, 26, 0, 0.04), 0 6px 16px rgba(61, 26, 0, 0.06)',
        'hover': '0 6px 16px rgba(61, 26, 0, 0.08), 0 12px 32px rgba(61, 26, 0, 0.08)',
      },
    },
  },
  plugins: [],
}