/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    '@tailwindcss/postcss': {
      safelist: [
        // make sure dynamic styles get built
        'text-st-success',
        'border-st-success',
        'text-st-error',
        'border-st-error',
        'text-st-warning',
        'border-st-warning',
        'text-text-primary',
        'border-text-primary',
        'border-disabled-border',
        'text-disabled-border',
        'text-text-secondary',
      ],
    },
  },
}

export default config
