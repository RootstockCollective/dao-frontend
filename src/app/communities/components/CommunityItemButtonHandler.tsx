import { Paragraph } from '@/components/TypographyNew'
import Link from 'next/link'

interface CommunityItemButtonHandlerProps {
  nftAddress?: string
  readMoreLink?: string
}

/**
 * As we will have community cards that are not NFTs, we need to handle the button click differently.
 * If we have a read more prop, we will use that link, otherwise we will use the nftAddress.
 * @param nftAddress
 * @param readMoreLink
 * @constructor
 */
export const CommunityItemButtonHandler = ({ nftAddress, readMoreLink }: CommunityItemButtonHandlerProps) => {
  let href = nftAddress ? `/communities/nft/${nftAddress}` : '/communities'
  let target = undefined
  if (readMoreLink) {
    href = readMoreLink
    target = '_blank'
  }
  return (
    <Link href={href} target={target}>
      <Paragraph>Learn more {/* Icon here */}</Paragraph>
    </Link>
  )
}
