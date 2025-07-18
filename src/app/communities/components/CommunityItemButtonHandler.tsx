import { Paragraph } from '@/components/TypographyNew'
import Link from 'next/link'
import { ArrowRightIconKoto } from '@/components/Icons'

interface CommunityItemButtonHandlerProps {
  nftAddress?: string
  readMoreLink?: string
  color?: string
}

/**
 * As we will have community cards that are not NFTs, we need to handle the button click differently.
 * If we have a read more prop, we will use that link, otherwise we will use the nftAddress.
 * @param nftAddress
 * @param readMoreLink
 * @param color
 * @constructor
 */
export const CommunityItemButtonHandler = ({
  nftAddress,
  readMoreLink,
  color = 'white',
}: CommunityItemButtonHandlerProps) => {
  let href = nftAddress ? `/communities/nft/${nftAddress}` : '/communities'
  let target = undefined
  if (readMoreLink) {
    href = readMoreLink
    target = '_blank'
  }
  return (
    <Link href={href} target={target}>
      <div className={'flex flex-row gap-1 items-center'} style={{ color }}>
        <Paragraph>Learn more</Paragraph>
        <ArrowRightIconKoto color={color} />
      </div>
    </Link>
  )
}
