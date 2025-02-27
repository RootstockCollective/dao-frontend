import { Paragraph, Span } from '@/components/Typography'
import Image from 'next/image'
import { ArrowUpRightIcon } from '@/components/Icons'
import Link from 'next/link'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { BoltSvg } from '@/components/BoltSvg'

interface CommunityItemProps {
  leftImageSrc: string
  title: string
  subtitle: string
  nftAddress: string
  description: string
  numberOfMembers: number
}

export const CommunityItem = ({
  leftImageSrc,
  title,
  subtitle,
  nftAddress,
  description,
}: CommunityItemProps) => {
  const { hasActiveCampaign, boostData } = useNFTBoosterContext()

  const isBoosted = hasActiveCampaign && boostData?.nftContractAddress === nftAddress

  return (
    <div
      className={`rounded-[8px] bg-input-bg p-[16px] w-[358px] ${isBoosted ? 'shadow-[0px_0px_20.799999237060547px_0px_rgba(192,247,255,0.43)]' : ''}`}
      data-testid={`${title}Card`}
    >
      <Link
        href={nftAddress ? `/communities/nft/${nftAddress}` : '/communities'}
        className="flex flex-col h-full"
      >
        <div className="flex mb-[22px] items-center">
          <div className="rounded-full overflow-hidden">
            <Image src={leftImageSrc} alt={title} width={50} height={50} />
          </div>
          <div className="flex-1 flex flex-col ml-[12px]">
            {isBoosted ? (
              <div className="inline-flex items-center">
                <GlowingLabel showGlow>{title}</GlowingLabel>
                <div className="-ml-[4px]">
                  <BoltSvg showGlow />
                </div>
              </div>
            ) : (
              <Span className="text-[15px] font-bold">{title}</Span>
            )}

            <Span size="small" variant="light">
              {subtitle}
            </Span>
          </div>
          {nftAddress && <ArrowUpRightIcon size={16} />}
        </div>
        <Paragraph variant="normal" className="mb-[8px] text-[14px]">
          {description}
        </Paragraph>
        <div className="flex-1" />
        {!nftAddress && <Image src="/images/text-coming-soon.svg" alt={title} width={121} height={121} />}
      </Link>
    </div>
  )
}
