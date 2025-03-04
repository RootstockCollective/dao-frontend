import { ArrowUpRightIcon } from '@/components/Icons'
import { Paragraph } from '@/components/Typography'
import Image from 'next/image'
import Link from 'next/link'
import { BoostedBox } from './components/BoostedBox'
import { ViewDetailsButton } from '@/app/communities/components/ViewDetailsButton'
import { BoostedLabel } from '@/app/communities/components/BoostedLabel'

interface CommunityItemProps {
  leftImageSrc: string
  title: string
  subtitle: string
  nftAddress: string
  description: string
  numberOfMembers: number
}

/**
 * Server Component: Renders a community card as part of the static communities page.
 * Dynamic highlighting of the 'Boosted' state is achieved through lightweight client components.
 */
export const CommunityItem = ({ leftImageSrc, title, nftAddress, description }: CommunityItemProps) => {
  return (
    <BoostedBox nftAddress={nftAddress}>
      <div
        className="h-full w-[269px] bg-foreground flex flex-col community-item-gradient-hover"
        data-testid={`${title}Card`}
      >
        {/* image */}
        <Image
          src={leftImageSrc}
          alt="An image that contains a community logo"
          className="mb-[20px] flex-1"
          width={269}
          height={265}
        />
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
        <ViewDetailsButton nftAddress={nftAddress} />
      </div>
    </BoostedBox>
  )
}
