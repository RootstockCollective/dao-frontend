import { Paragraph } from '@/components/Typography'
import Image from 'next/image'
import { BoostedBox } from './components/BoostedBox'
import { BoostedLabel } from '@/app/communities/components/BoostedLabel'
import { CommunityItemButtonHandler } from '@/app/communities/components/CommunityItemButtonHandler'
import { applyPinataImageOptions } from '@/lib/ipfs'

interface CommunityItemProps {
  cardImage: string
  title: string
  subtitle: string
  nftAddress: string
  description: string
  numberOfMembers: number
  readMoreLink?: string
}

/**
 * Server Component: Renders a community card as part of the static communities page.
 * Dynamic highlighting of the 'Boosted' state is achieved through lightweight client components.
 */
// prettier-ignore
export const CommunityItem = ({ cardImage, title, nftAddress, description, readMoreLink }: CommunityItemProps) => {
  const isExternalImage = cardImage.startsWith('http')
  const image = isExternalImage ? applyPinataImageOptions(cardImage, { width: 269, height: 269, quality: 90 }) : cardImage
  return (
    <BoostedBox nftAddress={nftAddress}>
      <div
        className="h-full w-[269px] bg-foreground flex flex-col community-item-gradient-hover"
        data-testid={`${title}Card`}
      >
        {/* image */}
        <div className="relative mb-[20px] w-full aspect-square">
          <Image
            crossOrigin={isExternalImage ? 'anonymous' : undefined}
            unoptimized={isExternalImage}
            src={image}
            alt={title}
            sizes="269px"
            fill
          />
        </div>
        <div className="flex flex-col flex-1">
          {/* Title */}
          <div className="mb-[5px]">
            <BoostedLabel nftAddress={nftAddress}>
              <Paragraph
                className="text-[20px] px-[14px] uppercase break-words pt-[5px]"
                fontFamily="kk-topo"
              >
                {title}
              </Paragraph>
            </BoostedLabel>
          </div>
          {/* Description */}
          <Paragraph className="text-[14px] px-[14px]">{description}</Paragraph>
        </div>
        {/* View details */}
        <CommunityItemButtonHandler nftAddress={nftAddress} readMoreLink={readMoreLink} />
      </div>
    </BoostedBox>
  )
}
