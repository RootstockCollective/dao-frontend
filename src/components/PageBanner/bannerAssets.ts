export const BANNER_DEFAULT_ARTWORK = '/images/notification-default.webp'

export const BANNER_DESKTOP_OVERLAY =
  'linear-gradient(90deg, #171412 0%, #171412 24%, rgba(23,20,18,0.88) 38%, rgba(23,20,18,0.35) 58%, rgba(23,20,18,0) 76%)'

const HEADER_SOLID_UNTIL = 'max(58%, 640px)'

export const BANNER_HEADER_OVERLAY = [
  'linear-gradient(90deg',
  `#171412 0%`,
  `#171412 ${HEADER_SOLID_UNTIL}`,
  `rgba(23,20,18,0.82) calc(${HEADER_SOLID_UNTIL} + 6%)`,
  `rgba(23,20,18,0.42) calc(${HEADER_SOLID_UNTIL} + 14%)`,
  `rgba(23,20,18,0.12) calc(${HEADER_SOLID_UNTIL} + 24%)`,
  `rgba(23,20,18,0) 100%)`,
].join(', ')

export const BANNER_HEADER_ARTWORK_FILTER = 'brightness-85 contrast-80'

export const BANNER_MOBILE_OVERLAY =
  'linear-gradient(180deg, rgba(23,20,18,0.95) 0%, rgba(23,20,18,0.9) 55%, rgba(23,20,18,0.6) 100%)'

export const BANNER_CTA_CLASSES =
  'border-banner-ink bg-banner-accent text-banner-on-accent shadow-[0_3px_0_var(--color-banner-ink)] btn-iridescent'

export const BANNER_EYEBROW_CLASSES = 'text-[12px] tracking-[0.16em]'
