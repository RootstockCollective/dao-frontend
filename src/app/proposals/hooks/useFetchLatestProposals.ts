import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Interface } from 'ethers'
import { useMemo } from 'react'
import { getAddress, parseEventLogs } from 'viem'
import { ADDRESS_PADDING_LENGTH, RELAY_PARAMETER_PADDING_LENGTH } from '@/app/proposals/shared/utils'

const useFetchLatestProposals = () => {
  return useQuery({
    queryFn: fetchProposalsCreatedCached,
    queryKey: ['proposalsCreated'],
    refetchInterval: 30_000,
  })
}

export const useFetchAllProposals = () => {
  const { data } = useFetchLatestProposals()

  const latestProposals = useMemo(() => {
    if (data?.data) {
      const proposals = parseEventLogs({
        abi: GovernorAbi,
        logs: data.data,
        eventName: 'ProposalCreated',
      })

      // remove duplicates
      return (
        proposals
          .filter(
            (proposal, index, self) =>
              self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
          )
          // @ts-ignore
          .sort((a, b) => b.timeStamp - a.timeStamp)
      )
    }
    return []
  }, [data])

  return { latestProposals }
}

const RELAY_FUNCTION = 'relay'
const RELAY_FUNCTION_SELECTOR = new Interface(GovernorAbi).getFunction(RELAY_FUNCTION)?.selector
if (!RELAY_FUNCTION_SELECTOR) {
  throw new Error(`Function ${RELAY_FUNCTION} not found in GovernorAbi.`)
}

const BIM_WHITELIST_FUNCTION = 'whitelistBuilder' // TODO: refactor
const BIM_WHITELIST_FUNCTION_SELECTOR = new Interface(SimplifiedRewardDistributorAbi).getFunction(
  BIM_WHITELIST_FUNCTION,
)?.selector
if (!BIM_WHITELIST_FUNCTION_SELECTOR) {
  throw new Error(`Function ${BIM_WHITELIST_FUNCTION} not found in SimplifiedRewardDistributorAbi.`)
}

type ElementType<T> = T extends (infer U)[] ? U : never

type EventLog = ElementType<ReturnType<typeof parseEventLogs<typeof GovernorAbi, true, 'ProposalCreated'>>>
export type CreateBuilderProposalEventLog = EventLog & { timeStamp: number }

export type BimProposalCachedEvent = {
  event: CreateBuilderProposalEventLog
  builder: string
}

export type BimEventByIdMap = Record<string, BimProposalCachedEvent['event']>

export type ProposalsPerBuilder = Record<BimProposalCachedEvent['builder'], BimEventByIdMap>

export type ProposalQueryResult<Data> = Omit<Partial<UseQueryResult<Data>>, 'isLoading'> & {
  isLoading: boolean
}

export const useFetchCreateBuilderProposals = (): ProposalQueryResult<ProposalsPerBuilder> => {
  const { data: fetchedData, isLoading, error } = useFetchLatestProposals()

  const latestProposals = useMemo(() => {
    if (!fetchedData?.data) {
      return {} as ProposalsPerBuilder
    }

    const events = parseEventLogs({
      abi: GovernorAbi,
      logs: fetchedData.data,
      eventName: 'ProposalCreated',
    }) as CreateBuilderProposalEventLog[]

    // deduplicate
    const eventsMap = new Map(events.map(eventItem => [eventItem.args.proposalId, eventItem])).values()

    // why can't we use block number instead of timestamp which is not supported by the type?
    const sortedAndRelayFilteredEvents = Array.from(eventsMap)
      .sort(({ timeStamp: a }, { timeStamp: b }) => b - a)
      .filter(({ args: { calldatas } }) =>
        calldatas.find(calldata => calldata.startsWith(RELAY_FUNCTION_SELECTOR)),
      )
    const bimProposalMap = sortedAndRelayFilteredEvents.reduce<ProposalsPerBuilder>((acc, event) => {
      const bimWhitelistFunctionHash = BIM_WHITELIST_FUNCTION_SELECTOR.slice(2)
      const relayPadding = RELAY_FUNCTION_SELECTOR.length + RELAY_PARAMETER_PADDING_LENGTH
      const bimEventCalldatas = event.args.calldatas.find(calldata =>
        calldata.startsWith(bimWhitelistFunctionHash, relayPadding),
      )

      if (bimEventCalldatas) {
        const addressStart = relayPadding + bimWhitelistFunctionHash.length + ADDRESS_PADDING_LENGTH
        const addressEnd = addressStart + 40
        const addressSlice = `0x${bimEventCalldatas.slice(addressStart, addressEnd)}`
        let builder
        try {
          builder = getAddress(addressSlice)
        } catch (e) {
          console.error('useFetchCreateBuilderProposal:: Failed to parse builder address', e)
          return acc
        }
        const existingBuilder = acc[builder] || {}

        acc = {
          ...acc,
          [builder]: {
            ...existingBuilder,
            [event.args.proposalId.toString()]: event,
          },
        }
      }

      return acc
    }, {})

    return bimProposalMap
  }, [fetchedData?.data])

  return {
    data: latestProposals,
    isLoading: isLoading,
    error: error,
  }
}
