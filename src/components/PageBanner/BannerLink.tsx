import Link from 'next/link'

import { CommonComponentProps } from '@/components/commonProps'
import { ArrowUpRightLightIcon } from '@/components/Icons'

interface BannerLinkProps extends CommonComponentProps<HTMLAnchorElement> {
  href: string
}

/** External link in banner copy: underlined on hover, with an up-right arrow, opens in a new tab. */
export const BannerLink = ({ href, children, ...props }: BannerLinkProps) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1 no-underline hover:underline"
    target="_blank"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
    <ArrowUpRightLightIcon aria-hidden size={20} />
  </Link>
)
