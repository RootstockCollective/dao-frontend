import { HeaderTitle } from '@/components/Typography'
import { CommunityCard } from '@/app/user/Communities/CommunityCard'
import { JoinACommunity } from '@/app/user/Communities/JoinACommunity'
import { useEffect, useRef, useState } from 'react'
import { useCommunity } from '@/shared/hooks/useCommunity'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { SpinnerIcon } from '@/components/Icons'

const communities: string[] = Object.keys(communitiesMapByContract)

export const CommunitiesSection = () => (
  <div>
    <UserCommunities nftAddresses={communities} />
  </div>
)

const UserCommunities = ({ nftAddresses }: { nftAddresses: string[] }) => {
  // For each NFT address, fetch the info
  const [nftsInfo, setNftsInfo] = useState(
    nftAddresses.map(nftAddress => ({ address: nftAddress, isLoading: true, isMember: false, imageUri: '' })),
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

  return (
    <>
      <HeaderTitle className="mb-[24px] font-bold">
        Communities ({nftsOwned}){' '}
        {isLoadingNfts && (
          <span>
            <SpinnerIcon className="animate-spin inline-block" />
          </span>
        )}
      </HeaderTitle>
      <div className="flex flex-wrap gap-[24px]">
        {nftsInfo.map((nftInfo, index) => (
          <NftInfo
            key={nftInfo.address}
            nftAddress={nftInfo.address}
            onFinishedLoading={onNftFinishedLoading(index)}
          />
        ))}
      </div>
      {!isLoadingNfts && nftsOwned === 0 && <JoinACommunity />}
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
  const data = useCommunity(nftAddress as `0x${string}`)
  const alreadyFinishedLoading = useRef(false)
  useEffect(() => {
    if (!data.isLoading && !alreadyFinishedLoading.current) {
      onFinishedLoading(data.isMember, data.nftMeta?.image)
      alreadyFinishedLoading.current = true
    }
  }, [data, onFinishedLoading])

  if (data.nftName && data.isMember) {
    return (
      <CommunityCard
        img={data.nftMeta?.image || ''}
        title={data.nftName}
        link={`/communities/nft/${nftAddress}`}
        description={data.nftMeta?.description || ''}
        members={data.membersCount.toString()}
      />
    )
  }
  return null
}
