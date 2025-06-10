'use client'
import { CopyButton } from '@/components/CopyButton'
import { truncateMiddle } from '@/lib/utils'
import { ReactNode } from 'react'
import { Paragraph } from '@/components/Typography'
import { useCommunityNFT } from '@/app/communities/nft/[address]/CommunityNFTContext'

/**
 * pioneer, holders, followers
 * @constructor
 */
export const NFTMiscData = () => {
  const { nftName, membersCount, nftAddress } = useCommunityNFT()
  return (
    <div>
      <DivWithBorderTop
        firstParagraph={`${nftName ?? ''} NFT`}
        secondParagraph={<CopyButton copyText={nftAddress}>{truncateMiddle(nftAddress, 4, 4)}</CopyButton>}
      />
      <DivWithBorderTop firstParagraph="Holders" secondParagraph={membersCount} />
    </div>
  )
}

interface DivWithBorderTopProps {
  firstParagraph: ReactNode
  secondParagraph: ReactNode
}

function DivWithBorderTop({ firstParagraph, secondParagraph }: DivWithBorderTopProps) {
  return (
    <div className="flex justify-between py-[24px] border-t-2 border-t-[rgba(255,255,255,0.4)]">
      {/* Avoid wrapping react element with a paragraph  */}
      {typeof firstParagraph === 'object' ? firstParagraph : <Paragraph>{firstParagraph}</Paragraph>}
      {typeof secondParagraph === 'object' ? secondParagraph : <Paragraph>{secondParagraph}</Paragraph>}
    </div>
  )
}
