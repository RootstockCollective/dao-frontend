import { CommunityCard } from '@/app/user/Communities/CommunityCard'
import { JoinACommunity } from '@/app/user/Communities/JoinACommunity'
import { useCommunity } from '@/shared/hooks/useCommunity'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { SectionHeader } from '@/components/SectionHeader'
import { useAccount } from 'wagmi'
import { useEffect, useRef, useState } from 'react'
import { useNFTBoosterContext } from '@/app/providers/NFT/BoosterContext'
import { Address } from 'viem'
import { CardPlaceholder } from '@/components/loading-components'
import { applyPinataImageOptions } from '@/lib/ipfs'

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
    return <JoinACommunity />
  }

  return (
    <>
      <SectionHeader
        name="Communities"
        description={
          'When you own or earn badges as part of contributions and participation in Collective Communities they will be summarized below.'
        }
      />
      <div className="flex flex-wrap gap-[24px]">
        {nftsInfo.map((nftInfo, index) => (
          <NftInfo
            key={nftInfo.address}
            nftAddress={nftInfo.address}
            onFinishedLoading={onNftFinishedLoading(index)}
          />
        ))}
      </div>
    </>
  )
}

const NftInfo = ({
  nftAddress,
  onFinishedLoading,
}: {
  nftAddress: string
  onFinishedLoading: (isMember: boolean, imageUri?: string) => void
}) => {
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
      <CommunityCard
        img={data.nftMeta?.image}
        title={data.nftName}
        link={`/communities/nft/${nftAddress}`}
        description={data.nftMeta?.description || ''}
        members={data.membersCount.toString()}
        isBoosted={isCampaignActive(nftAddress) && isBoosted}
        alt={data.nftName + ' logo'}
      />
    )
  }
  return null
}
