import { DecorativeSquares } from '@/app/backing/components/DecorativeSquares'
import { Header, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { FC } from 'react'
import { CommonComponentProps } from '@/components/commonProps'
import { CRWhitepaperLink } from '@/app/collective-rewards/shared/components/CRWhitepaperLinkNew'

export const BackingBanner: FC<CommonComponentProps> = ({ className = '' }) => {
  return (
    <div
      className={cn(
        'relative flex flex-col items-start gap-2 self-stretch py-6 px-4 md:p-6 text-v3-text-0',
        className,
      )}
      style={{
        background: 'linear-gradient(270deg, #442351 0%, #C0F7FF 49.49%, #E3FFEB 139.64%)',
      }}
      data-testid="BackingBanner"
    >
      <DecorativeSquares className="absolute left-0 top-[-30px] z-base" color="#d2fbf6" />
      <Header variant="h3">{`WHAT'S IN IT FOR ME?`}</Header>
      <ul className="flex flex-col gap-2 md:gap-0 list-[circle] pl-6">
        <li>
          <Paragraph>Earn a share of the rewards from Builders you back</Paragraph>
        </li>
        <li>
          <Paragraph>Influence how rewards are distributed to Builders</Paragraph>
        </li>
        <li>
          <Paragraph>Retain full ownership and access to your stRIF</Paragraph>
        </li>
      </ul>
      <Span className="mt-2">
        See the <CRWhitepaperLink>Whitepaper</CRWhitepaperLink>
      </Span>
    </div>
  )
}
