/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          background: '#0f172a', // slate-900
          card: '#1e293b',       // slate-800
          border: '#334155',     // slate-700
          textMain: '#f1f5f9',   // slate-100
          textSub: '#94a3b8',    // slate-400
          primary: '#06b6d4',    // cyan-500
          secondary: '#3b82f6',  // blue-500
          success: '#10b981',    // emerald-500
          warning: '#f59e0b',    // amber-500
          danger: '#f43f5e',     // rose-500
          info: '#0ea5e9',       // sky-500
        }
      }
    },
  },
  plugins: [],
}
