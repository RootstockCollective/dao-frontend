import { ReactNode } from 'react'
import { TokenImage } from '../TokenImage'
import { currentLinks } from './links'

interface Link {
  href: string
  testId: string
  content: ReactNode
}
export const sidebarLinksData: Link[] = [
  {
    href: currentLinks.rif,
    testId: 'RIFLink',
    content: 'RIF',
  },
  {
    href: currentLinks.forum,
    testId: 'ForumLink',
    content: 'Forum',
  },
  {
    href: currentLinks.getRif,
    testId: 'GetRIFLink',
    content: (
      <div className="inline-flex">
        Get RIF
        <TokenImage className={'ml-[4px]'} symbol={'RIF'} size={16} />
      </div>
    ),
  },
  {
    href: currentLinks.rbtc,
    testId: 'GetRBTCLink',
    content: (
      <div className="inline-flex">
        Get RBTC
        <TokenImage className={'ml-[4px]'} symbol={'RBTC'} size={16} />
      </div>
    ),
  },
  {
    href: currentLinks.registerRns,
    testId: 'GetRNSDomainLink',
    content: 'Get RNS Domain',
  },
]
