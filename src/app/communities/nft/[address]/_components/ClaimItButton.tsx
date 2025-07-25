'use client'
import { Button } from '@/components/ButtonNew'
import { Span, Paragraph } from '@/components/TypographyNew'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'
import { useAccount } from 'wagmi'
import { HTMLAttributes } from 'react'

export const ClaimItButton = (props: HTMLAttributes<HTMLButtonElement>) => {
  const { handleMinting, tokensAvailable, isClaiming, isChecking } = useCommunityNFT()
  const { address } = useAccount()

  return (
    <Button
      variant="primary"
      onClick={handleMinting}
      disabled={!tokensAvailable || !address || isClaiming || isChecking}
      data-testid="claimButton"
      {...props}
    >
      <Paragraph className="leading-none">
        <Span className="font-bold mr-1 whitespace-nowrap">Claim badge</Span>
        <Span className="whitespace-nowrap">{tokensAvailable} left</Span>
      </Paragraph>
    </Button>
  )
}
