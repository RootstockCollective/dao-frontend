import { DecorativeSquares } from '@/app/backing/components/DecorativeSquares'
import { Header, Span } from '@/components/Typography'
import { Typography } from '@/components/Typography/Typography'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '@/components/commonProps'
import { CRWhitepaperLink } from '@/app/collective-rewards/shared/components/CRWhitepaperLinkNew'

export const BackingBanner: FC<CommonComponentProps> = ({ className = '' }) => {
  return (
    <div
      className={cn('relative flex flex-col items-start gap-2 self-stretch p-6 text-v3-text-0', className)}
      style={{
        background: 'linear-gradient(270deg, #442351 0%, #C0F7FF 49.49%, #E3FFEB 139.64%)',
      }}
      data-testid="BackingBanner"
    >
      <DecorativeSquares className="absolute left-0 top-[-30px] z-20" color="#d2fbf6" />
      <Header variant="h3">WHAT&apos;S IN IT FOR ME?</Header>
      <ul className="list-[circle] pl-6">
        <li>
          <Typography>Earn a share of the rewards from Builders you back</Typography>
        </li>
        <li>
          <Typography>Influence how rewards are distributed to Builders</Typography>
        </li>
        <li>
          <Typography>Retain full ownership and access to your stRIF</Typography>
        </li>
      </ul>
      <Span>
        See the <CRWhitepaperLink>Whitepaper</CRWhitepaperLink>
      </Span>
    </div>
  )
}
