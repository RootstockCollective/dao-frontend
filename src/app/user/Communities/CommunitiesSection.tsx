import { useCommunity } from '@/shared/hooks/useCommunity'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { useAccount } from 'wagmi'
import { useEffect, useRef, useState } from 'react'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import type { Address } from 'viem'
import { CardPlaceholder } from '@/components/loading-components'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { HeroCommunitiesComponent, type HeroCommuntiesSectionProps } from '@/app/communities/components'
import { ResponsiveCommunityItemHOC } from '@/app/communities/components/ResponsiveCommunityItemHOC'

const nftAddresses: string[] = Object.keys(communitiesMapByContract)

interface Props {
  heroComponentConfig?: HeroCommuntiesSectionProps
}

export const CommunitiesSection = ({ heroComponentConfig }: Props) => {
  const { isConnected } = useAccount()

  // For each NFT address, fetch the info
  const [nftsInfo, setNftsInfo] = useState(
    nftAddresses.map(nftAddress => ({
      address: nftAddress,
      isLoading: true,
      isMember: false,
      imageUri: '',
    })),
  )

  const onNftFinishedLoading = (index: number) => (isMember: boolean, imageUri?: string) => {
    const updateState = [...nftsInfo]
    const itemToUpdate = updateState[index]
    itemToUpdate.isLoading = false
    itemToUpdate.isMember = isMember
    itemToUpdate.imageUri = imageUri || ''
    setNftsInfo(updateState)
  }

  const { isLoadingNfts, nftsOwned } = nftsInfo.reduce(
    (prev, nftInfo) => {
      if (!prev.isLoadingNfts) {
        prev.isLoadingNfts = nftInfo.isLoading
      }
      if (nftInfo.isMember) {
        prev.nftsOwned += 1
      }
      return prev
    },
    { isLoadingNfts: false, nftsOwned: 0 },
  )

  if (!isConnected || (!isLoadingNfts && nftsOwned === 0)) {
    return <HeroCommunitiesComponent shouldShowLearnMore {...heroComponentConfig} />
  }

  return (
    <SectionContainer title="YOUR COMMUNITIES" headerVariant="h3">
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 md:gap-2">
        {nftsInfo.map((nftInfo, index) => (
          <NftInfo
            key={nftInfo.address}
            nftAddress={nftInfo.address}
            onFinishedLoading={onNftFinishedLoading(index)}
            defaultCommunityVariant="landscape"
          />
        ))}
      </div>
    </SectionContainer>
  )
}

interface NftInfoProps {
  nftAddress: string
  onFinishedLoading: (isMember: boolean, imageUri?: string) => void
  defaultCommunityVariant: 'portrait' | 'landscape'
}

const NftInfo = ({ nftAddress, onFinishedLoading, defaultCommunityVariant = 'portrait' }: NftInfoProps) => {
  const data = useCommunity(nftAddress as Address)
  const { isBoosted, isCampaignActive, boostData } = useNFTBoosterContext()
  const alreadyFinishedLoading = useRef(false)

  useEffect(() => {
    if (!data.isLoading && !alreadyFinishedLoading.current) {
      onFinishedLoading(data.isMember, data.nftMeta?.image)
      alreadyFinishedLoading.current = true
    }
  }, [data, onFinishedLoading])

  if (data.isLoading) {
    return <CardPlaceholder />
  }
  if (data.nftName && data.isMember) {
    return (
      <ResponsiveCommunityItemHOC
        leftImageSrc={data.nftMeta?.image || ''}
        title={data.nftName}
        subtitle={data.nftMeta?.description || ''}
        nftAddress={nftAddress}
        description={data.nftMeta?.description || ''}
        variant={defaultCommunityVariant}
        enableDebris
        specialPower={communitiesMapByContract[nftAddress].specialPower}
        boostedPercentage={
          isCampaignActive(nftAddress) && isBoosted ? boostData?.boostPercentage.toString() : undefined
        }
      />
    )
  }
  return null
}
