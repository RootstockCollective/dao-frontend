'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import Image from 'next/image'
import { CommunityItem } from '@/app/communities/CommunityItem'
import { firstNft } from '@/app/communities/communityUtils'

// @TODO remove and dynamically fetch the community
const firstCommunity = {
  leftImageSrc: firstNft.imageSrc,
  title: 'Early Adopters',
  subtitle: 'DeFi',
  description: `Crypto ipsum bitcoin ethereum dogecoin litecoin. Hedera USD kadena chainlink arweave hive binance.
      Shiba-inu terra ICON IOTA ICON livepeer velas uniswap. Kadena kusama IOTA horizen.`,
  nftAddress: 'asd',
  numberOfMembers: 0,
}

export default function Communities() {
  return (
    <MainContainer notProtected>
      <div className="ml-[24px]">
        <Image
          src="/images/communities-header.svg"
          alt="Communities"
          width={0}
          height={0}
          style={{ width: '100%', height: 'auto' }}
        />
        <div className="mt-[16px]">
          <CommunityItem {...firstCommunity} /> {/* @TODO remove and fetch dynamically? [after mvp] */}
        </div>
      </div>
    </MainContainer>
  )
}
