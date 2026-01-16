'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useCommunityNFT } from '../CommunityNFTContext'
import type { Address } from 'viem'
import { useAccount } from 'wagmi'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { cn, truncateMiddle } from '@/lib/utils'
import { ImageDebris } from '@/app/communities/components/ImageDebris'
import { useAddToWallet } from '../_components/useAddToWallet'
import { Button } from '@/components/Button'
import { Header, Paragraph } from '@/components/Typography'
import { CopyButton } from '@/components/CopyButton'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import type { ConnectButtonComponentProps } from '@/shared/walletConnection'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ClaimItButton } from '../_components/ClaimItButton'
import { ArrowUpRightLightIcon } from '@/components/Icons'
import { BoostedLabelKoto } from '@/app/communities/components'
import { Divider } from '@/components/Divider'

// Responsive button styles - mobile: sticky bottom with background, desktop: normal positioning
const mobileButtonSx = 'fixed bottom-0 left-0 right-0 z-sticky bg-bg-100 p-4'
const desktopButtonSx =
  'md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:bg-transparent md:p-0 md:mt-10'
const dividerSx = 'mb-4 md:hidden'

export function CommunityInfoHeader({ address: nftAddress }: { address: Address }) {
  const { isConnected } = useAccount()
  const { image, tokenId = 0, isMember, isMintable, tokensAvailable } = useCommunityNFT()

  const { title, specialPower, activation, requirement, detailedDescription, discussionLink } = useMemo(
    () => communitiesMapByContract[nftAddress.toLowerCase()],
    [nftAddress],
  )
  const { isCampaignActive, boostData } = useNFTBoosterContext()
  const showNFTBoost = isCampaignActive(nftAddress)
  const {
    isHidden: isAddToWalletButtonHidden,
    onAddToWallet,
    isLoading: isAddToWalletLoading,
  } = useAddToWallet()

  return (
    <div className={cn('p-4 pb-8 rounded-sm bg-bg-80', 'flex flex-col sm:flex-row sm:gap-8')}>
      {/* NFT image. Members see their own NFT, non-members see community cover */}
      <div className={cn('relative transition-all duration-300 ', isMember ? 'grow' : 'basis-1/2')}>
        <Image
          width={525}
          height={525}
          src={image}
          alt={title}
          className="w-full h-fit object-cover"
          crossOrigin="anonymous"
          unoptimized
        />
        <ImageDebris className="block sm:hidden" image={image} config="bottomRightDiagonal" />
        <ImageDebris className="hidden sm:block" image={image} config="topRightDiagonal" />
      </div>
      <div className={cn('transition-all duration-300', isMember ? 'basis-[244px]' : 'basis-1/2')}>
        {/* Card main header */}
        <Header variant="h1" caps className="mt-16 text-3xl leading-10">
          {title}
        </Header>
        {/* Address copy button - aligned left */}
        <div className="py-1 flex">
          <CopyButton copyText={nftAddress}>
            <Paragraph>{truncateMiddle(nftAddress, 5, 4)}</Paragraph>
          </CopyButton>
          <div className="grow" />
        </div>
        {/* Description block */}
        <Paragraph className="mt-6 md:mt-12">{detailedDescription}</Paragraph>
        {/* Discussion button */}
        {discussionLink && (
          <a href={discussionLink} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary-outline" className="mt-4 flex gap-1 font-rootstock-sans">
              Join the discussion
              <ArrowUpRightLightIcon size={20} />
            </Button>
          </a>
        )}
        {/* Little table */}
        <div className={cn('mt-6 flex flex-col')}>
          <div className={cn('flex gap-4 flex-col md:flex-row', { 'md:flex-col': isMember })}>
            {/* Special power column */}
            <div className="flex-1 flex flex-col gap-1">
              <Paragraph className="text-text-60 font-medium">Special power</Paragraph>
              <Paragraph className="font-kk-topo">{specialPower}</Paragraph>
            </div>
            {/* Activation time column */}
            <div className="flex-1 flex flex-col gap-1">
              <Paragraph className="text-text-60 font-medium">Activation</Paragraph>
              <Paragraph className="font-kk-topo">{activation}</Paragraph>
            </div>
          </div>

          {/* NFT ID column - showing only to member */}
          {isMember && (
            <div className="flex flex-col gap-1 mt-4">
              <Paragraph className="text-text-60 font-medium">Your badge ID</Paragraph>
              <Paragraph className="font-kk-topo">#{tokenId}</Paragraph>
            </div>
          )}

          {/* Boost label */}
          {showNFTBoost && (
            <BoostedLabelKoto
              text={
                <div>
                  <Paragraph caps className="tracking-wider font-medium">
                    {boostData?.boostPercentage}% rewards boost
                  </Paragraph>
                  <Paragraph className="normal-case">Take it while it lasts!</Paragraph>
                </div>
              }
              className="mt-6 w-full max-w-[441px]"
            />
          )}

          {/* Eligibility requirements block */}
          {!isMember && (
            <div className="grid grid-cols-1 gap-1 mt-8 md:mt-10">
              <Paragraph caps className="font-medium">
                Eligibility rules
              </Paragraph>
              <Paragraph>{requirement}</Paragraph>
            </div>
          )}

          {/* Responsive buttons - desktop: normal position, mobile: sticky bottom */}
          {!isMember && isMintable && isConnected && tokensAvailable > 0 && (
            <div className={cn(mobileButtonSx, desktopButtonSx)}>
              {/* Divider only on mobile */}
              <Divider className={dividerSx} />
              <ClaimItButton />
            </div>
          )}

          {!isConnected && (
            <div className={cn(mobileButtonSx, desktopButtonSx)}>
              <Divider className={dividerSx} />
              <ConnectWorkflow ConnectComponent={ConnectButton} />
            </div>
          )}

          {isConnected && isMember && !isAddToWalletButtonHidden && (
            <div className={cn(mobileButtonSx, desktopButtonSx)}>
              <Divider className={dividerSx} />
              <Button onClick={() => onAddToWallet()} disabled={isAddToWalletLoading}>
                Add to wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ConnectButton = (props: ConnectButtonComponentProps) => (
  <Button className="whitespace-nowrap w-full" {...props} data-testid="ConnectButtonEligibility">
    Connect wallet to check eligibility
  </Button>
)
