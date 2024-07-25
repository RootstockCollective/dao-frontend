import { Paragraph } from '@/components/Typography/Paragraph'
import { Link } from '@/components/Link'
import { currentLinks } from '@/components/LeftSidebar/links'

export const UsefulLinks = () => (
  <div>
    <Paragraph className="mb-[24px] text-[16px]">Useful links</Paragraph>
    <Link href={currentLinks.registerRns} variant="menu" className="mb-[16px] text-[16px]" target="_blank">
      Register RNS Domain
    </Link>
    <Link href={currentLinks.tokenBridge} variant="menu" className="mb-[16px] text-[16px]" target="_blank">
      Token Bridge dApp
    </Link>
    <Link href={currentLinks.flyover} variant="menu" className="mb-[16px] text-[16px]" target="_blank">
      Flyover dApp
    </Link>
    <Link href={currentLinks.readMore} variant="menu" className="mb-[16px] text-[16px]" target="_blank">
      Read more about RIF
    </Link>
  </div>
)
