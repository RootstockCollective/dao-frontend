'use client'
import { useAccount } from 'wagmi'
import { Span } from '@/components/Typography'
import Image from 'next/image'
import { UserMemberSection } from './UserMemberSection'
import { ClaimItButton } from '../_components/ClaimItButton'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'

export const MembershipNFTSection = () => {
  const { name, image, isMember, tokenId, isMintable } = useCommunityNFT()
  const { isConnected } = useAccount()

  return (
    <div className="flex-1">
      <div>
        <Span className="mb-6 font-bold inline-block">Membership NFT</Span>
        <div className="flex gap-6">
          <Image
            alt={name ?? 'Early Adopters NFT'}
            src={image}
            className="w-full self-center max-w-56 rounded-md"
            width={500}
            height={500}
          />
          {isMember && tokenId ? (
            <UserMemberSection />
          ) : (
            <div>
              <Span>By joining to the community you will receive one of the NFTs</Span>
              {isMintable && isConnected && (
                <>
                  {/* @TODO was this removed from design? */}
                  {/*<Paragraph size="small">{tokensAvailable} NFTs left to claim.</Paragraph>*/}
                  <ClaimItButton />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
