import DecorativeSquares from '@/components/Icons/DecorativeSquares'
import { Header } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
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
      <DecorativeSquares width={50} height={40} className="absolute left-0 top-[-30px] z-20" />
      <Header variant="h3">WHAT&apos;S IN IT FOR ME?</Header>
      <ul className="list-[circle] pl-6">
        <li>
          <Typography>You retain full ownership and access to your stRIF</Typography>
        </li>
        <li>
          <Typography>Your allocations shape the Builders Rewards</Typography>
        </li>
        <li>
          <Typography>You earn a portion of the backed Builders Rewards</Typography>
        </li>
        <li>
          <Typography>
            For more, see the <CRWhitepaperLink>Whitepaper</CRWhitepaperLink>
          </Typography>
        </li>
      </ul>
    </div>
  )
}
