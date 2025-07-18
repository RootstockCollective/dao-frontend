import { useCommunity } from '@/shared/hooks/useCommunity'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { useAccount } from 'wagmi'
import { useEffect, useRef, useState } from 'react'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { Address } from 'viem'
import { CardPlaceholder } from '@/components/loading-components'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { cn } from '@/lib/utils'
import { SectionContainer } from '@/app/communities/components/SectionContainer'
import { HeroCommunitiesComponent } from '@/app/communities/components'

const communities: string[] = Object.keys(communitiesMapByContract)

export const CommunitiesSection = () => (
  <div>
    <UserCommunities nftAddresses={communities} />
  </div>
)

interface Props {
  nftAddresses: string[]
}

const UserCommunities = ({ nftAddresses }: Props) => {
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
    return <HeroCommunitiesComponent shouldShowLearnMore />
  }

  const defaultCommunityVariant = nftsOwned <= 2 ? 'landscape' : 'portrait'
  const communityGridClass = nftsOwned <= 2 ? 'xl:grid-cols-2' : 'xl:grid-cols-4'

  return (
    <>
      <SectionContainer title="YOUR COMMUNITIES" headerVariant="h3">
        <div className={cn('grid sm:grid-cols-1 gap-[24px]', communityGridClass)}>
          {nftsInfo.map((nftInfo, index) => (
            <NftInfo
              key={nftInfo.address}
              nftAddress={nftInfo.address}
              onFinishedLoading={onNftFinishedLoading(index)}
              defaultCommunityVariant={defaultCommunityVariant}
            />
          ))}
        </div>
      </SectionContainer>
    </>
  )
}

interface NftInfoProps {
  nftAddress: string
  onFinishedLoading: (isMember: boolean, imageUri?: string) => void
  defaultCommunityVariant: 'portrait' | 'landscape'
}

const NftInfo = ({ nftAddress, onFinishedLoading, defaultCommunityVariant = 'portrait' }: NftInfoProps) => {
  const data = useCommunity(nftAddress as Address)
  const { isBoosted, isCampaignActive } = useNFTBoosterContext()
  const alreadyFinishedLoading = useRef(false)

  useEffect(() => {
    if (!data.isLoading && !alreadyFinishedLoading.current) {
      onFinishedLoading(data.isMember, data.nftMeta?.image)
      alreadyFinishedLoading.current = true
    }
  }, [data, onFinishedLoading, nftAddress])

  if (data.isLoading) {
    return <CardPlaceholder />
  }
  if (data.nftName && data.isMember) {
    return (
      <CommunityItem
        leftImageSrc={data.nftMeta?.image || ''}
        title={data.nftName}
        subtitle={data.nftMeta?.description || ''}
        nftAddress={nftAddress}
        description={data.nftMeta?.description || ''}
        variant={defaultCommunityVariant}
        enableDebris
        specialPower={communitiesMapByContract[nftAddress].specialPower}
        isBoosted={isCampaignActive(nftAddress) && isBoosted}
      />
    )
  }
  return null
}
