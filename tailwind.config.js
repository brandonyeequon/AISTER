/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1c6b3d",
        "primary-dark": "#15552b",
        "primary-light": "#2d8f5f",
        bg: "#e8e8e8",
        card: "#f5f5f5",
        text: "#8f949c",
        border: "#ccc",
      },
      fontFamily: {
        sans: ['"Source Sans Pro"', 'sans-serif'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '26px',
        '4xl': '40px',
      },
      fontWeight: {
        normal: 400,
        semibold: 600,
        bold: 700,
        black: 900,
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '24px',
      },
      boxShadow: {
        md: '0 4px 15px rgba(0, 0, 0, 0.25)',
        lg: '0 4px 24px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
}
