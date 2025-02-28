import { Paragraph, Span } from '@/components/Typography'
import Image from 'next/image'
import { BsArrowUpRight } from 'react-icons/bs'
import Link from 'next/link'
import { BoostedBox } from './components/BoostedBox'
import { BoostedLabel } from './components/BoostedLabel'

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
// prettier-ignore
export const CommunityItem = ({ leftImageSrc, title, subtitle, nftAddress, description }: CommunityItemProps) => {
  return (
    <BoostedBox nftAddress={nftAddress}>
      <div className={'h-full p-[16px] w-[358px] rounded-[8px] bg-input-bg'} data-testid={`${title}Card`}>
        <Link
          href={nftAddress ? `/communities/nft/${nftAddress}` : '/communities'}
          className="flex flex-col h-full"
        >
          <div className="flex mb-[22px] items-center">
            <div className="rounded-full overflow-hidden">
              <Image src={leftImageSrc} alt={title} width={50} height={50} />
            </div>
            <div className="flex-1 flex flex-col ml-[12px]">
              <BoostedLabel nftAddress={nftAddress}>{title}</BoostedLabel>
              <Span size="small" variant="light">
                {subtitle}
              </Span>
            </div>
            {nftAddress && <BsArrowUpRight />}
          </div>
          <Paragraph variant="normal" className="mb-[8px] text-[14px]">
            {description}
          </Paragraph>
          <div className="flex-1" />
          {!nftAddress && <Image src="/images/text-coming-soon.svg" alt={title} width={121} height={121} />}
        </Link>
      </div>
    </BoostedBox>
  )
}
