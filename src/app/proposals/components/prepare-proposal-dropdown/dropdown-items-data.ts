import { BulbIcon } from './icons/bulb'
import { KycIcon } from './icons/kyc'

interface Item {
  id: string
  Icon: typeof BulbIcon
  title: string
  text: string
  linkUrl: string
}
export const dropdownItemsData: Item[] = [
  {
    id: '1',
    Icon: BulbIcon,
    title: 'Discuss on Discourse',
    text: 'Clarify your project՚s purpose on Discourse',
    linkUrl: 'https://gov.rootstockcollective.xyz/',
  },
  {
    id: '2',
    Icon: KycIcon,
    title: 'Verify KYC',
    text: 'Complete your KYC to ensure eligibility. (Apply for Grants)',
    linkUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
  },
]
