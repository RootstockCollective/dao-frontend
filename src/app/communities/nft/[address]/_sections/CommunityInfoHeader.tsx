'use client'

import { useCommunityNFT } from '../CommunityNFTContext'
import { type Address } from 'viem'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { ImageMask } from '@/components/ImageMask'
import { useCurrentUserNFTInWallet } from '../utilsClient'
import { AddToWalletButton } from '../_components/AddToWalletButton'
import { Button } from '@/components/ButtonNew'
import { Header, Paragraph } from '@/components/TypographyNew'

interface Props {
  address: Address
}

export function CommunityInfoHeader({ address: nftAddress }: Props) {
  const [isMember, setIsMember] = useState(false)
  const { image, tokenId = 0 } = useCommunityNFT()
  const { nftsInWallet, isNFTInWalletLoading } = useCurrentUserNFTInWallet()
  const { title, subtitle, cover } = useMemo(
    () => communitiesMapByContract[nftAddress.toLowerCase()],
    [nftAddress],
  )

  //const { isCampaignActive, boostData } = useNFTBoosterContext()
  //const showNFTBoost = isCampaignActive(nftAddress)

  return (
    <div className={cn('p-4 rounded-sm bg-bg-80', 'flex flex-col sm:flex-row')}>
      <div className={cn('transition-all duration-300', isMember ? 'sm:flex-[3]' : 'flex-1')}>
        <ImageMask
          src={image}
          fallbackSrc={cover}
          width={525}
          height={525}
          squareSize={10}
          className="w-full h-fit"
        />
      </div>
      <div className={cn('transition-all duration-300', isMember ? 'sm:flex-1' : 'flex-1')}>
        <Header>{title}</Header>
        {/* <AddToWalletButton /> */} {/* временно для тестов */}
        <Button className="whitespace-nowrap" onClick={() => setIsMember(st => !st)}>
          Add to wallet
        </Button>
      </div>
    </div>
  )
}
/* 
import { BoltSvg } from '@/components/BoltSvg'
import { Chip } from '@/components/Chip/Chip'
import { DiscordIcon, LinkIcon, TwitterXIcon } from '@/components/Icons'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { Paragraph } from '@/components/Typography'
import { DateTime } from 'luxon'
import { MembershipNFTSection } from './_sections/MembershipNFTSection'
import { NFTMiscData } from '@/app/communities/nft/[address]/_components/NFTMiscData'
import { ipfsGatewayUrl } from '@/lib/ipfs'
<div className="flex flex-col xl:flex-row justify-between pl-4 gap-8">
        50%: NFT INFO
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <Paragraph className="text-5xl uppercase font-normal tracking-[-0.96px]" fontFamily="kk-topo">
              {nftInfo?.title}
            </Paragraph>
          </div>
          <div className="mb-[24px] font-extralight">
            <>
              {nftInfo?.longDescription({
                activation: showNFTBoost
                  ? DateTime.fromSeconds(Number(boostData?.timestamp) ?? 0)
                      .toFormat('MMM yyyy')
                      .toUpperCase()
                  : undefined,
              })}
            </>
          </div>

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
          Hidden until we get social media data
          <div className="hidden gap-[8px] mt-[16px] mb-[24px]">
            Chips with community links
            <Chip className="justify-center w-14 bg-white text-black">
              <TwitterXIcon size={16} fill="black" />
              
            </Chip>
            <Chip className="bg-[rgba(74,102,247,1)] text-white">
              <DiscordIcon />
              <span>Discord</span>
            </Chip>
            <Chip className="bg-primary text-white">
              <LinkIcon size={16} />
              <span>Website</span>
            </Chip>
          </div>
          <NFTMiscData />
        </div>
        50%: NFT Image and Membership
        <MembershipNFTSection />
      </div>
      Holders list
      
*/
