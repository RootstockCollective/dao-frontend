import { CommonComponentProps } from '@/components/commonProps'
import { ArrowUpRightLightIcon } from '@/components/Icons/ArrowUpRightLightIcon'
import { Link } from '@/components/Link'

export const CRWhitepaperLink = ({ children, ...props }: CommonComponentProps<HTMLAnchorElement>) => (
  <Link
    href="https://rootstockcollective.xyz/pdfs/rewards-whitepaper.pdf"
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
