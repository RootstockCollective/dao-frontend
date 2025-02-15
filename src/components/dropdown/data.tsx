import { RBTC, RIF, stRIF } from '@/lib/constants'
import { currentLinks } from '../LeftSidebar/links'
import { TokenImage, TokenImageProps } from '../TokenImage'
import { BulbIcon } from './icons/bulb'
import { KycIcon } from './icons/kyc'
import { NumberIcon } from './icons/number'
import { ComponentType, SVGAttributes } from 'react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import Big from 'big.js'
import { TokenBalanceRecord } from '@/app/user/types'
import { Address } from 'viem'
import { parseVoteCastEvents } from '@/app/proposals/hooks/useVoteCast'
import { parseNewAllocationEvent } from '@/app/collective-rewards/allocations/hooks/useNewAllocationEvent'

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

export interface DropdownTopic {
  items: DropdownItem[]
  topic?: string
}

export const VOTE = 'VOTE'
export const ALLOCATIONS = 'ALLOCATIONS'
export const COMPLETED = 'COMPLETED'

const onExternal = (linkUrl: string) => window.open(linkUrl, '_blank', 'noopener,noreferrer')

export const prepareProposalsData: DropdownTopic[] = [
  {
    items: [
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
    ],
  },
]

const checkSteps = async (items: DropdownItem[], balances: TokenBalanceRecord, address: Address) => {
  const balanceDependentSteps = checkBalancesSteps(items, balances)
  try {
    const checkedEvents = await checkEvents(balanceDependentSteps, address)

    return checkedEvents
  } catch (err) {
    console.log('CHECKING THE STEPS FAILED', err)
    return balanceDependentSteps
  }
}

const checkBalancesSteps = (items: DropdownItem[], balances: TokenBalanceRecord): DropdownTopic[] => {
  if (Big(balances[stRIF].balance).gt(0)) {
    return [
      {
        items: items.slice(3),
      },
      {
        topic: COMPLETED,
        items: items.slice(0, 3),
      },
    ]
  }

  if (Big(balances[RIF].balance).gt(0)) {
    return [{ items: items.slice(2) }, { topic: COMPLETED, items: items.slice(0, 2) }]
  }

  if (Big(balances[RBTC].balance).gt(0)) {
    return [{ items: items.slice(1) }, { topic: COMPLETED, items: items.filter(step => step.id === RBTC) }]
  }

  return [{ items }]
}

const checkEvents = async (steps: DropdownTopic[], address: Address): Promise<DropdownTopic[]> => {
  try {
    // returned previous votes from VoteCast
    // address for testing: '0x81Df35317DF983e419630908eF6CB2BB48cE21Ca'
    const votingEvents = await parseVoteCastEvents(address)()

    const [notCompleted, completed] = steps
    const completedObject = !completed ? { topic: COMPLETED, items: [] } : completed

    if (votingEvents && votingEvents.length >= 1) {
      const searchIndex = notCompleted.items.findIndex(item => item.id === VOTE)
      completedObject.items.push(notCompleted.items.splice(searchIndex, 1)[0])
    }

    // returned array from NewAllocations
    // address for testing: '0xEC068F31FA194d9036Ed3C61c3546111Ac3C8902'
    const allocationsArray = await parseNewAllocationEvent(address)()

    if (allocationsArray && allocationsArray.length >= 1) {
      const searchIndex = notCompleted.items.findIndex(item => item.id === ALLOCATIONS)
      completedObject.items.push(notCompleted.items.splice(searchIndex, 1)[0])
    }

    return [notCompleted, completedObject]
  } catch (err) {
    console.log('CHECK OF EVENTS FAILED', err)
    return steps
  }
}

const getStartedData = (router: AppRouterInstance): DropdownItem[] => [
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
    onClick: () => onExternal(currentLinks.stakeRif),
  },
  {
    id: VOTE,
    Icon: props => <NumberIcon number="4" {...props} />,
    title: 'VOTE ON YOUR FIRST PROPOSAL',
    text: '',
    onClick: () => router.push('/proposals'),
  },
  {
    id: ALLOCATIONS,
    Icon: props => <NumberIcon number="5" {...props} />,
    title: 'MAKE YOUR FIRST ALLOCATIONS OF RIF',
    text: 'Learn more about allocations',
    onClick: () => onExternal(currentLinks.allocations),
  },
]

export const getGetStartedData = (
  router: AppRouterInstance,
  balances: TokenBalanceRecord,
  address: Address,
) => checkSteps(getStartedData(router), balances, address)
