/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["_includes/**/*.njk", "posts/**/*.md", "*.md", "*.njk"],
  theme: {
    extend: {},
  },
  plugins: [require("./_11ty/tailwind-theme.js")],
};
