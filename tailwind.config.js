/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#d17842',
          100: '#0c0f14',
          200: '#252a32',
        },
        secondary: {
          50: '#262b33',
          100: '#262b33',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Color secundario
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6', // Color de acento
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        success: {
          500: '#10b981', // Verde para indicar éxito
        },
        warning: {
          500: '#f59e0b', // Amarillo para advertencias
        },
        danger: {
          500: '#ef4444', // Rojo para errores
        },
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}
