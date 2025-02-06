import { RBTC, RIF, stRIF } from '@/lib/constants'
import { currentLinks } from '../LeftSidebar/links'
import { TokenImage, TokenImageProps } from '../TokenImage'
import { BulbIcon } from './icons/bulb'
import { KycIcon } from './icons/kyc'
import { NumberIcon } from './icons/number'
import { ComponentType, SVGAttributes } from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export type SVGIconType = ComponentType<SVGAttributes<SVGSVGElement> & Record<string, any>>

type TokenImageWithPreconfigutedSymbol = Omit<TokenImageProps, 'symbol'>

// TODO: refactor Icon and TitleIcon to be more generic
export interface DropdownItem {
  id: string
  Icon: SVGIconType
  title: string
  text: string
  onClick: () => void
  TitleIcon?: (props: TokenImageWithPreconfigutedSymbol) => JSX.Element
}

const onExternal = (linkUrl: string) => window.open(linkUrl, '_blank', 'noopener,noreferrer')

export const prepareProposalsData: DropdownItem[] = [
  {
    id: '1',
    Icon: BulbIcon,
    title: 'Discuss on Discourse',
    text: 'Clarify your project՚s purpose on Discourse',
    onClick: () => onExternal('https://gov.rootstockcollective.xyz/'),
  },
  {
    id: '2',
    Icon: KycIcon,
    title: 'Verify KYC',
    text: 'Complete your KYC to ensure eligibility. (Apply for Grants)',
    onClick: () =>
      onExternal(
        'https://docs.google.com/forms/d/e/1FAIpQLSd4HklyTFPFAo2I0l_N5fy_di01WZ27e4uFDG1KVy8ZIOSiow/viewform',
      ),
  },
]

export const getStartedData = (router: AppRouterInstance): DropdownItem[] => [
  {
    id: RBTC,
    Icon: props => <NumberIcon number="1" {...props} />,
    title: 'GET RBTC',
    text: 'Learn more about rBTC',
    onClick: () => onExternal(currentLinks.rbtc),
    TitleIcon: (props: TokenImageWithPreconfigutedSymbol) => (
      <TokenImage symbol={RBTC} size={props.size} className={props.className} />
    ),
  },
  {
    id: RIF,
    Icon: props => <NumberIcon number="2" {...props} />,
    title: 'GET RIF',
    text: 'Learn more about RIF',
    onClick: () => onExternal(currentLinks.getRif),
    TitleIcon: (props: TokenImageWithPreconfigutedSymbol) => (
      <TokenImage symbol={RIF} size={props.size} className={props.className} />
    ),
  },
  {
    id: stRIF,
    Icon: props => <NumberIcon number="3" {...props} />,
    title: 'Stake RIF',
    text: 'Learn more about staking',
    onClick: () => onExternal(''),
  },
  {
    id: 'VOTE',
    Icon: props => <NumberIcon number="4" {...props} />,
    title: 'VOTE ON YOUR FIRST PROPOSAL',
    text: '',
    onClick: () => router.push('/proposals'),
  },
  {
    id: 'ALLOCATIONS',
    Icon: props => <NumberIcon number="5" {...props} />,
    title: 'MAKE YOUR FIRST ALLOCATIONS OF RIF',
    text: 'Learn more about allocations',
    onClick: () => onExternal(currentLinks.allocations),
  },
]
