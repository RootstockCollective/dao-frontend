'use client'

import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { BoltSvg } from '@/components/BoltSvg'
import { Chip } from '@/components/Chip/Chip'
import { DiscordIcon, LinkIcon, TwitterXIcon } from '@/components/Icons'
import { GlowingLabel } from '@/components/Label/GlowingLabel'
import { Paragraph } from '@/components/Typography'
import { DateTime } from 'luxon'
import { NftHoldersSection } from './_sections/NftHoldersSection'
import { MembershipNFTSection } from './_sections/MembershipNFTSection'
import { NFTMiscData } from '@/app/communities/nft/[address]/_components/NFTMiscData'
import { CommunityNFTProvider } from '@/app/communities/nft/[address]/CommunityNFTContext'
import { useParams } from 'next/navigation'
import { Address } from 'viem'

/**
 * Community Page
 */
export default function Page() {
  const { address: nftAddress } = useParams<{ address: Address }>() ?? {}

  const nftInfo = communitiesMapByContract[nftAddress.toLowerCase() || '']
  if (nftAddress && !nftInfo) {
    console.warn('The current NFT address is not registered. Please check the config.')
  }
  const { isCampaignActive, boostData } = useNFTBoosterContext()

  const showNFTBoost = isCampaignActive(nftAddress)

  const { discussionLink } = nftInfo || {}

  return (
    <CommunityNFTProvider nftAddress={nftAddress}>
      <div className="flex flex-col xl:flex-row justify-between pl-4 gap-8">
        {/* 50%: NFT INFO*/}
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

          {/* Conditionally render Discussion button */}
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
          {/* Hidden until we get social media data */}
          <div className="hidden gap-[8px] mt-[16px] mb-[24px]">
            {/* Chips with community links */}
            <Chip className="justify-center w-14 bg-white text-black">
              <TwitterXIcon size={16} fill="black" />
              {/* <span>X</span> */}
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
        {/* 50%: NFT Image and Membership*/}
        <MembershipNFTSection />
      </div>
      {/* Holders list */}
      <NftHoldersSection address={nftAddress} />
    </CommunityNFTProvider>
  )
}
