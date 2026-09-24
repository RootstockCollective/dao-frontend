/** Shared by the banner and the docked bar so both Connect buttons look and press the same. */
export const CONNECT_CTA_CLASSES = [
  'flex shrink-0 cursor-pointer items-center whitespace-nowrap rounded-[6px] bg-btc-orange',
  'font-rootstock-sans font-bold text-banner-on-accent',
  'transition-[background-color,scale] duration-[160ms,120ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]',
  'hover:bg-btc-orange-hover active:scale-[0.97]',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v3-rif-blue',
].join(' ')

/** "DON'T MISS" above the title, in the Tags cut of Rootstock Sans. */
export const EYEBROW_CLASSES = 'font-rootstock-sans font-medium uppercase tracking-[0.14em] text-btc-orange'
