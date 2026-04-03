/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        roseNight: "#1a0a0f",
        roseDeep: "#2d1020",
        blush: "#f4a7b9",
        dustyRose: "#c97a90",
        warmWhite: "#fdf0f3",
        mutedRose: "#c9a0ab"
      },
      fontFamily: {
        heading: ["Cormorant Garamond", "serif"],
        body: ["DM Sans", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      }
    }
  },
  plugins: []
};
