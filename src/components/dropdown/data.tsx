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

/**
 * @note possibly move to immutable return, now it is done this way out of convinience
 * and because it is highly unlikely to be used anywhere apart from this case
 * @description check balances being > 0
 * Modifies the items array
 * @param items - items to check
 * @param balances - user balances from BalancesContext
 * @returns if stRIF > 0 - all balances items returned
 * if RIF  > 0 - RBTC and RIF is returned
 * if RBTC > 0 - only it is returned
 */

const checkBalancesSteps = (items: DropdownItem[], balances: TokenBalanceRecord) => {
  if (Big(balances[stRIF].balance).gt(0)) {
    return items.splice(0, 3)
  }

  if (Big(balances[RIF].balance).gt(0)) {
    return items.splice(0, 2)
  }

  if (Big(balances[RBTC].balance).gt(0)) {
    return items.splice(0, 1)
  }

  return []
}

/**
 * @description calls parseVoteCastEvents to check address for VoteCast events
 * @param items - items to filter based on the votingEvents.length
 * @param address - address to check for VoteCast events(parseVoteCastEvents)
 * @returns [DropdownItem.id === VOTE] | undefined
 */

const checkVoted = async (items: DropdownItem[], address: Address): Promise<DropdownItem | undefined> => {
  try {
    // returned previous votes from VoteCast
    // address for testing: '0x81Df35317DF983e419630908eF6CB2BB48cE21Ca'
    const votingEvents = await parseVoteCastEvents(address)()

    if (votingEvents && votingEvents.length >= 1) {
      return items.filter(item => item.id === VOTE)[0]
    }
  } catch (err) {
    console.log('ERRORED in checkVoted', err)
  }
}

/**
 * @description calls parseNewAllocationEvent to check address for NewAllocation events
 * @param items - items to filter based on the allocationsArray.length
 * @param address - address to check for NewAllocation events(parseVoteCastEvents)
 * @returns [DropdownItem.id === ALLOCATION] | undefined
 */

const checkAllocations = async (
  items: DropdownItem[],
  address: Address,
): Promise<DropdownItem | undefined> => {
  try {
    // returned array from NewAllocations
    // address for testing: '0xEC068F31FA194d9036Ed3C61c3546111Ac3C8902'
    const allocationsArray = await parseNewAllocationEvent(address)()

    if (allocationsArray && allocationsArray.length >= 1) {
      return items.filter(item => item.id === ALLOCATIONS)[0]
    }
  } catch (err) {
    console.log('ERROR in checkAllocations', err)
  }
}

/**
 * @description based on address received checks for VoteCast(checkVoted) and NewAllocation(checkAllocations) events
 * and based on that sets values under completedObject
 * @param items - DropdownItems to check
 * @param address - address of the user which will be used in events
 * @param balances - current balances from BalancesContext
 */
const checkEvents = async (
  items: DropdownItem[],
  address: Address,
  balances: TokenBalanceRecord,
): Promise<DropdownTopic[]> => {
  try {
    const copiedItems = [...items]
    const checkedVotedItem = await checkVoted(copiedItems, address)
    const checkedAllocationsItem = await checkAllocations(copiedItems, address)
    const completedObject: DropdownTopic = { topic: COMPLETED, items: [] }

    if (checkedVotedItem) {
      completedObject.items.push(...copiedItems.splice(0, 3))
      completedObject.items.push(checkedVotedItem)
    } else {
      completedObject.items.push(...checkBalancesSteps(copiedItems, balances))
    }

    if (checkedAllocationsItem) {
      completedObject.items.push(checkedAllocationsItem)
    }

    return [{ items: copiedItems }, completedObject]
  } catch (err) {
    console.log('CHECK OF EVENTS FAILED', err)
    return [{ items }]
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
) => checkEvents(getStartedData(router), address, balances)
