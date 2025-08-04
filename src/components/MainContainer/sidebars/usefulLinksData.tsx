import { ReactNode } from 'react'
import { TokenImage } from '@/components/TokenImage'
import { currentLinks } from '@/lib/links'

interface UsefulLink {
  href: string
  testId: string
  content: ReactNode
}
export const usefulLinksData: UsefulLink[] = [
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
        <TokenImage className="ml-1" symbol="RIF" size={16} />
      </div>
    ),
  },
  {
    href: currentLinks.rbtc,
    testId: 'GetRBTCLink',
    content: (
      <div className="inline-flex">
        Get rBTC
        <TokenImage className="ml-1" symbol="RBTC" size={16} />
      </div>
    ),
  },
  {
    href: currentLinks.registerRns,
    testId: 'GetRNSDomainLink',
    content: 'Get RNS Domain',
  },
  {
    href: currentLinks.feedbackForm,
    testId: 'SubmitFeedbackLink',
    content: 'Submit Feedback',
  },
]
