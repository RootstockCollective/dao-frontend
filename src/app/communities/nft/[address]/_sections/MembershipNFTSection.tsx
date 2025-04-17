'use client'
import { useAccount } from 'wagmi'
import { Paragraph, Span } from '@/components/Typography'
import Image from 'next/image'
import { UserMemberSection } from './UserMemberSection'
import { ClaimItButton } from '../_components/ClaimItButton'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'

export const MembershipNFTSection = () => {
  const { name, image, isMember, tokenId, isMintable, tokensAvailable } = useCommunityNFT()
  const { isConnected } = useAccount()

  return (
    <div className="flex-1">
      <div>
        <Span className="mb-6 font-bold inline-block">Membership NFT</Span>
        <div className="flex gap-6">
          <Image
            /* Image is coming from the Piñata gateway already optimized */
            unoptimized
            alt={name ?? 'Early Adopters NFT'}
            src={image}
            className="w-full self-center max-w-56 rounded-md"
            width={224}
            height={224}
            crossOrigin="anonymous"
          />
          {isMember && tokenId ? (
            <UserMemberSection />
          ) : (
            <div>
              <Span>By joining to the community you will receive one of the NFTs</Span>
              {isMintable && isConnected && (
                <>
                  <Paragraph size="small">{tokensAvailable} NFTs left to claim.</Paragraph>
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
