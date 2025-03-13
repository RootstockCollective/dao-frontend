'use client'
import { Paragraph, Span } from '@/components/Typography'
import { truncateMiddle } from '@/lib/utils'
import { SelfContainedNFTBoosterCard } from '@/app/shared/components/NFTBoosterCard/SelfContainedNFTBoosterCard'
import { AddToWalletButton } from '@/app/communities/nft/[address]/_components/AddToWalletButton'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'

/**
 * Component to show user NFT info plus add to wallet logic
 * @constructor
 */
export const UserMemberSection = () => {
  const { tokenId, title, description, nftAddress: address } = useCommunityNFT()

  const { isBoosted, isCampaignActive } = useNFTBoosterContext()
  const showNFTBoost = isCampaignActive(address)

  return (
    <div className="flex flex-col gap-4">
      <Paragraph variant="semibold" className="text-[18px]">
        {title} #{tokenId}
      </Paragraph>
      {/* `Owned by 0x00000` colored with 2 colors */}
      <div className="font-light">
        <Span>Owned{address && ' by '}</Span>
        {address && <Span className="text-primary">{truncateMiddle(address, 4, 3)}</Span>}
      </div>

      <SelfContainedNFTBoosterCard forceRender={showNFTBoost && isBoosted} />

      <div>
        <AddToWalletButton />
      </div>

      <Span className="inline-block text-[14px] tracking-wide font-light">{description}</Span>
    </div>
  )
}
