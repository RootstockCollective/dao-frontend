import { CommunityCard } from '@/app/user/Communities/CommunityCard'
import { JoinACommunity } from '@/app/user/Communities/JoinACommunity'
import { useCommunity } from '@/shared/hooks/useCommunity'
import { communitiesMapByContract } from '@/app/communities/communityUtils'
import { SectionHeader } from '@/components/section-header'
import { Link } from '@/components/Link'
import { useAccount } from 'wagmi'
import { useState } from 'react'

const communities: string[] = Object.keys(communitiesMapByContract)

export const CommunitiesSection = () => (
  <div>
    <UserCommunities nftAddresses={communities} />
  </div>
)

export const UserCommunities = ({ nftAddresses }: { nftAddresses: string[] }) => {
  const { isConnected } = useAccount()

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
      <SectionHeader
        name="Communities"
        description={
          <>
            Select one or more Builders you want to back. You retain full ownership and access to your stRIF
            while earning a portion of their rewards. For more information check the{' '}
            <Link variant={'section-header'} href={'https://www.google.com/'}>
              Whitepaper
            </Link>
            .
          </>
        }
      />
      {!isConnected || (!isLoadingNfts && nftsOwned === 0) ? (
        <JoinACommunity />
      ) : (
        <div className="flex flex-wrap gap-[24px]">
          {nftsInfo.map((nftInfo, index) => (
            <NftInfo
              key={nftInfo.address}
              nftAddress={nftInfo.address}
              onFinishedLoading={onNftFinishedLoading(index)}
            />
          ))}
        </div>
      )}
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
  const { isBoosted, boostData } = useNFTBoosterContext()
  const alreadyFinishedLoading = useRef(false)

  const isCampaignActive = boostData?.nftContractAddress === nftAddress && isBoosted

  useEffect(() => {
    if (!data.isLoading && !alreadyFinishedLoading.current) {
      onFinishedLoading(data.isMember, data.nftMeta?.image)
      alreadyFinishedLoading.current = true
    }
  }, [data, onFinishedLoading])

  // DAO FIXME: the nftName from data is in CapitaCamelCase but also with abbreviations,
  // so it renders as single word atm (e.g. "OGFOUNDERS" instead of "OG FOUNDERS")
  // one option is to use the hardcoded data from communitiesMapByContract to get the name by address;
  // another option is to use the nftName from data and split it by capital letters, w/ some exceptions for abbreviations (e.g. "OGFounders" -> "OG FOUNDERS" and not "O G FOUNDERS");
  // however there are so many exceptions to this rule that it might be better to just use the hardcoded data, failing the ability to enforce a proper name format upon the nft creation (or the storage of metadata).
  // NOTE! Also consider that the data in metadata does not match the hardcoded data, so now, the names in users communities are not the same as the ones on the communities page.
  if (data.nftName && data.isMember) {
    return (
      <CommunityCard
        img={data.nftMeta?.image || ''}
        title={data.nftName}
        link={`/communities/nft/${nftAddress}`}
        description={data.nftMeta?.description || ''}
        members={data.membersCount.toString()}
        isBoosted={isCampaignActive}
      />
    )
  }
  return null
}
