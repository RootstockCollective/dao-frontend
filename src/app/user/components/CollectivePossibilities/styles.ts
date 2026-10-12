import { BANNER_CTA_CLASSES } from '@/components/PageBanner'
import { cn } from '@/lib/utils'

export const CONNECT_CTA_CLASSES = cn(
  BANNER_CTA_CLASSES,
  'w-fit shrink-0 whitespace-nowrap py-0',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v3-rif-blue',
)

export const EYEBROW_CLASSES = 'font-rootstock-sans font-medium uppercase tracking-[0.14em] text-btc-orange'
