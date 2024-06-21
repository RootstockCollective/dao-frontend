import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-open-sans)'],
        sora: ['Sora'],
        inter: ['Inter'],
      },
      colors: {
        primary: 'var(--color-primary)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'st-success': 'var(--st-success)',
        'st-info': 'var(--st-info)',
        'st-error': 'var(--st-error)',
        'st-pink': 'var(--st-pink)',
      },
    },
  },
  plugins: [],
}

export default config
