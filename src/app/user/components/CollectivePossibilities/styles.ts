import { BANNER_CTA_CLASSES } from '@/components/PageBanner'
import { cn } from '@/lib/utils'

/**
 * Shared by the banner and the docked bar so both Connect buttons look and press the same: the
 * call to action of the redesigned banners (see PageBanner), plus the focus ring of the prompt.
 */
export const CONNECT_CTA_CLASSES = cn(
  BANNER_CTA_CLASSES,
  'w-fit shrink-0 whitespace-nowrap py-0',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v3-rif-blue',
)

/** "DON'T MISS" above the title, in the Tags cut of Rootstock Sans. */
export const EYEBROW_CLASSES = 'font-rootstock-sans font-medium uppercase tracking-[0.14em] text-btc-orange'
