/** The orange artwork every banner falls back to when it has no dedicated one. */
export const BANNER_DEFAULT_ARTWORK = '/images/notification-default.webp'

/**
 * Overlays shared by every banner that lays copy over artwork. The artwork is
 * anchored to the right, so the overlay fades it out towards the left (towards the
 * top on mobile, where the copy sits below the title) and keeps the text readable.
 */
export const BANNER_DESKTOP_OVERLAY =
  'linear-gradient(90deg, #171412 0%, #171412 24%, rgba(23,20,18,0.88) 38%, rgba(23,20,18,0.35) 58%, rgba(23,20,18,0) 76%)'

export const BANNER_MOBILE_OVERLAY =
  'linear-gradient(180deg, rgba(23,20,18,0.95) 0%, rgba(23,20,18,0.9) 55%, rgba(23,20,18,0.6) 100%)'
