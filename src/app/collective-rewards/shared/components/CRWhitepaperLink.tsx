import { Link } from '@/components/Link'
import { Span } from '@/components/Typography'
import { FC } from 'react'

interface Props {
  className?: string
}

export const CRWhitepaperLink: FC<Props> = ({ className }) => (
  <Link
    className="text-[#E56B1A]"
    href={'https://rootstockcollective.xyz/pdfs/rewards-whitepaper.pdf'}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Span className={className} data-testid="Whitepaper">
      Whitepaper
    </Span>
  </Link>
)
