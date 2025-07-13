import { Paragraph, Header } from '@/components/TypographyNew'
import Image from 'next/image'
import { BoostedBox } from './components/BoostedBox'
import { BoostedLabel } from '@/app/communities/components/BoostedLabel'
import { CommunityItemButtonHandler } from '@/app/communities/components/CommunityItemButtonHandler'
import { applyPinataImageOptions } from '@/lib/ipfs'
import { cn } from '@/lib/utils'
import { ImageDebris } from '@/app/communities/components/ImageDebris'

interface CommunityItemProps {
  leftImageSrc: string
  title: string
  subtitle: string
  nftAddress: string
  description: string
  numberOfMembers: number
  readMoreLink?: string
  variant?: 'portrait' | 'landscape'
  enableDebris?: boolean
}

/**
 * Server Component: Renders a community card as part of the static communities page.
 * Dynamic highlighting of the 'Boosted' state is achieved through lightweight client components.
 */
// prettier-ignore
export const CommunityItem = ({
  leftImageSrc,
  title,
  nftAddress,
  description,
  readMoreLink,
  variant = 'portrait',
  enableDebris = false
}: CommunityItemProps) => {
  const isExternalImage = leftImageSrc.startsWith('http')
  const image = isExternalImage
    ? applyPinataImageOptions(leftImageSrc, { width: 269, height: 269, quality: 90 })
    : leftImageSrc
  return (
    <BoostedBox nftAddress={nftAddress}>
      <div
        className={cn('h-full bg-bg-60 flex community-item-gradient-hover p-[16px] gap-[32px]', variant === 'portrait' ? 'flex-col' : 'flex-row')}
        data-testid={`${title}Card`}
      >
        {/* image */}
        <div className="relative w-full aspect-square">
          <Image
            crossOrigin={isExternalImage ? 'anonymous' : undefined}
            unoptimized={isExternalImage}
            src={image}
            alt={title}
            sizes="269px"
            fill
          />
          {enableDebris && <ImageDebris image={image} />}
        </div>
        <div className={cn('flex gap-[20px] flex-col')}>
          {/* Title */}
          <div className={cn(variant === 'landscape' ? 'mt-[32px]' : '')}>
            <BoostedLabel nftAddress={nftAddress}>
              <Header variant="h3" className="uppercase break-words pt-[5px]">
                {title}
              </Header>
            </BoostedLabel>
          </div>
          <div>
            <Paragraph className="text-bg-0 font-[500] mb-[8px]">Special power</Paragraph>
            <Header className="text-[20px]">20% voting booster</Header>
          </div>
          {/* Description */}
          <Paragraph>{description}</Paragraph>
          {/* Learn more */}
          <div>
            <CommunityItemButtonHandler nftAddress={nftAddress} readMoreLink={readMoreLink} />
          </div>
        </div>
      </div>
    </BoostedBox>
  )
}
