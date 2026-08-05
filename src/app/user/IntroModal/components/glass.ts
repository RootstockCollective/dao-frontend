/**
 * Dark glass, not light. Anything readable sitting on the onboarding gradient needs this:
 * the panel runs from brand orange to brand blue with a pale highlight blob travelling across
 * it, so white text placed straight onto it lands anywhere between 2.3:1 and 1.3:1. Darkening
 * what is behind the text is the only thing that holds contrast across every step's pose.
 */
export const GLASS_STYLE =
  'bg-bg-100/65 shadow-[inset_0px_0px_14px_0px_rgba(255,255,255,0.12)] backdrop-blur-md'
