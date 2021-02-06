module.exports = {
  purge: ["{components,pages}/**/*.{js,tsx}"],
  theme: {
    extend: {
      gridTemplateRows: {
        layout: "min-content auto min-content",
      },
    },
  },
};
