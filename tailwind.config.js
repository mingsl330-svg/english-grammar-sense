/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#667085",
        line: "#d9e2ea",
        paper: "#f6f8fb",
        ocean: "#1c6b7a",
        leaf: "#26805d",
        amber: "#b86b24",
        rose: "#b5474d"
      },
      boxShadow: {
        soft: "0 18px 45px rgba(23, 32, 42, 0.08)"
      }
    }
  },
  plugins: []
};
