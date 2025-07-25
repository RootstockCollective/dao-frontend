'use client'

import { useMemo } from 'react'
import { useCommunityNFT } from '../CommunityNFTContext'
import { type Address } from 'viem'
import { useAccount } from 'wagmi'
import { DateTime } from 'luxon'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { cn, truncateMiddle } from '@/lib/utils'
import { ImageMask } from '@/components/ImageMask'
import { AddToWalletButton } from '../_components/AddToWalletButton'
import { Button } from '@/components/ButtonNew'
import { Header, Paragraph } from '@/components/TypographyNew'
import { CopyButton } from '@/components/CopyButton'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { ConnectButtonComponentProps } from '@/shared/walletConnection'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ClaimItButton } from '../_components/ClaimItButton'

export function CommunityInfoHeader({ address: nftAddress }: { address: Address }) {
  const { isConnected } = useAccount()
  const { image, tokenId = 0, isMember, isMintable, tokensAvailable } = useCommunityNFT()

  const { title, specialPower, requirement, detailedDescription } = useMemo(
    () => communitiesMapByContract[nftAddress.toLowerCase()],
    [nftAddress],
  )
  const { isCampaignActive, boostData } = useNFTBoosterContext()
  const showNFTBoost = isCampaignActive(nftAddress)

  return (
    <div className={cn('p-4 rounded-sm bg-bg-80', 'flex flex-col sm:flex-row')}>
      {/* NFT image. Members see their own NFT, non-members see community cover */}
      <div className={cn('relative transition-all duration-300 ', isMember ? 'grow' : 'basis-1/2')}>
        <ImageMask src={image} width={525} height={525} squareSize={10} className="w-full h-fit" />
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
        <Paragraph className="mt-12">{detailedDescription}</Paragraph>
        {/* Table */}
        <div className={cn('mt-6 flex gap-4', isMember ? 'flex-col' : 'flex-row')}>
          {/* Special power column */}
          <div className="flex flex-col gap-2">
            <Paragraph className="text-text-60 font-medium">Special power</Paragraph>
            <Paragraph className="font-kk-topo">{specialPower}</Paragraph>
          </div>
          {/* Activation time column */}
          <div className="flex flex-col gap-2">
            <Paragraph className="text-text-60 font-medium">Activation</Paragraph>
            <Paragraph className="font-kk-topo">
              {DateTime.fromSeconds(Number(boostData?.timestamp) ?? 0).toFormat('MMMM yyyy')}
            </Paragraph>
          </div>
          {/* NFT ID column - showing only to member */}
          {isMember && (
            <div className="flex flex-col gap-2">
              <Paragraph className="text-text-60 font-medium">Your badge ID</Paragraph>
              <Paragraph className="font-kk-topo">#{tokenId}</Paragraph>
            </div>
          )}
        </div>
        {/* Eligibility requirements block */}
        {!isMember && (
          <div className="my-10 grid grid-cols-1 gap-2">
            <Paragraph caps className="font-medium">
              Eligibility rules
            </Paragraph>
            <Paragraph>{requirement}</Paragraph>
          </div>
        )}
        {/* Single button at a time */}
        <div className="mt-10">
          {!isMember && isMintable && isConnected && tokensAvailable > 0 && (
            <ClaimItButton className="mt-10" />
          )}
          {!isConnected && <ConnectWorkflow ConnectComponent={ConnectButton} />}
          {isConnected && isMember && <AddToWalletButton />}
        </div>
      </div>
    </div>
  )
}

const ConnectButton = (props: ConnectButtonComponentProps) => (
  <Button className="whitespace-nowrap" {...props}>
    Connect wallet to check eligibility
  </Button>
)
/* 
import { BoltSvg } from '@/components/BoltSvg'
import { Chip } from '@/components/Chip/Chip'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { MembershipNFTSection } from './_sections/MembershipNFTSection'
import { NFTMiscData } from '@/app/communities/nft/[address]/_components/NFTMiscData'

<div className="flex flex-col xl:flex-row justify-between pl-4 gap-8">
        50%: NFT INFO
        <div className="flex-1">


          Conditionally render Discussion button
          {discussionLink && (
            <div className="mb-[24px]">
              <a
                href={discussionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 transition-colors font-bold"
              >
                Discussion
              </a>
            </div>
          )}
          <div className="mb-[24px] font-extralight">
            <>
              {nftInfo?.campaignDetails &&
                nftInfo.campaignDetails({
                  activation: showNFTBoost
                    ? DateTime.fromSeconds(Number(boostData?.timestamp) ?? 0)
                        .toFormat('MMM yyyy')
                        .toUpperCase()
                    : undefined,
                })}
            </>
          </div>

          {showNFTBoost && (
            <div className="inline-flex items-center gap-1 pb-6">
              <BoltSvg />
              <GlowingLabel faded>Active Boost {boostData!.boostPercentage}%</GlowingLabel>
            </div>
          )}
          
          <NFTMiscData />
        </div>
        50%: NFT Image and Membership
        <MembershipNFTSection />
      </div>
      Holders list
      
*/
