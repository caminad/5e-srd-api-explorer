module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  purge: ['{components,pages}/**/*.{js,tsx}'],
  theme: {
    extend: {
      gridTemplateRows: {
        layout: 'min-content auto min-content',
      },
    },
  },
};
