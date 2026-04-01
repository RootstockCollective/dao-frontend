import { type Address } from 'viem'
import { NftHoldersSection } from './_sections/NftHoldersSection'
import { CommunityNFTProvider } from './CommunityNFTContext'
import { CommunityInfoHeader } from './_sections/CommunityInfoHeader'

interface PageProps {
  params: Promise<{ address?: string }>
}

/**
 * Community Page
 */
export default async function Page({ params }: PageProps) {
  const { address } = await params
  if (!address) return null
  const nftAddress = address.toLowerCase() as Address
  return (
    <CommunityNFTProvider nftAddress={nftAddress}>
      <div className="flex flex-col gap-2">
        <CommunityInfoHeader address={nftAddress} />
        <NftHoldersSection address={nftAddress} />
      </div>
    </CommunityNFTProvider>
  )
}
