import { CommonComponentProps } from '@/components/commonProps'
import { ArrowUpRightLightIcon } from '@/components/Icons/ArrowUpRightLightIcon'
import { Link } from '@/components/Link'
import { currentLinks } from '@/lib/links'

export const CRWhitepaperLink = ({ children, ...props }: CommonComponentProps<HTMLAnchorElement>) => (
  <Link
    href={currentLinks.rewardsWhitepaper}
    className="no-underline hover:underline gap-1"
    target="_blank"
    data-testid="whitepaper-link"
    rel="noopener noreferrer"
    {...props}
  >
    {children}
    <ArrowUpRightLightIcon size={20} />
  </Link>
)
