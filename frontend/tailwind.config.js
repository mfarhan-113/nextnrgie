module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "Poppins", "ui-sans-serif", "system-ui"],
      },
      colors: {
        muted: '#f6f8fa',
        primary: '#1976d2',
        accent: '#42a5f5',
        card: '#ffffff',
      },
      boxShadow: {
        neumorph: '4px 4px 16px #e0e6ed, -4px -4px 16px #ffffff',
      },
      borderRadius: {
        xl: '1.25rem',
      },
    },
  },
  plugins: [],
};
