import { ADDRESS_ANIMATION_DURATION } from './src/lib/constants'
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
      },
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'st-success': 'var(--st-success)',
        'st-info': 'var(--st-info)',
        'st-error': 'var(--st-error)',
        'st-white': 'var(--st-white)',
        'text-light': 'var(--text-light)',
        'disabled-primary': 'var(--disabled-primary)',
        'disabled-secondary': 'var(--disabled-secondary)',
        'input-bg': 'var(--input-bg)',
        'input-placeholder': 'var(--input-placeholder)',
        link: 'var(--link)',
        popover: {
          DEFAULT: 'var(--background)',
          foreground: 'var(--text-primary)',
        },
        accent: {
          DEFAULT: 'var(--input-bg)',
          foreground: 'var(--text-primary)',
        },
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-out-slide-out': {
          from: {
            opacity: '1',
            transform: 'translateY(0)',
            position: 'absolute',
          },
          to: {
            opacity: '0',
            transform: 'translateY(-100%)',
            position: 'absolute',
          },
        },
        'fade-in-slide-in': {
          from: {
            opacity: '0',
            transform: 'translate(-100%, 100%)',
          },
          to: {
            opacity: '1',
            transform: 'translate(0, 0)',
          },
        },
        'translate-x': {
          from: {
            transform: 'translateX(100px)',
          },
          to: {
            transform: 'translateX(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'translate-x': `translate-x ${ADDRESS_ANIMATION_DURATION}ms`,
        'fade-out-slide-out': `fade-out-slide-out ${ADDRESS_ANIMATION_DURATION}ms`,
        'fade-in-slide-in': `fade-in-slide-in ${ADDRESS_ANIMATION_DURATION}ms`,
      },
    },
    container: {
      center: true,
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
