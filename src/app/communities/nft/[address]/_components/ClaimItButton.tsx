'use client'
import { Button } from '@/components/Button'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'
import { useAccount } from 'wagmi'

export const ClaimItButton = () => {
  const { handleMinting, tokensAvailable, isClaiming, isChecking } = useCommunityNFT()
  const { address } = useAccount()

  return (
    <Button
      variant="primary"
      className="my-[16px] h-[58px]"
      onClick={handleMinting}
      disabled={!tokensAvailable || !address || isClaiming || isChecking}
      loading={isClaiming || isChecking}
      data-testid="claimButton"
    >
      Claim NFT
    </Button>
  )
}
