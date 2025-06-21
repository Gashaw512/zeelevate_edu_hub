
const isProduction = process.env.NODE_ENV === 'production';

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(isProduction && {
      cssnano: {
        preset: ['default', {
          discardComments: { removeAll: true }, // Strip all comments
          zindex: false, // Optional: avoid renumbering z-index
        }],
      },
    }),
  },
};
