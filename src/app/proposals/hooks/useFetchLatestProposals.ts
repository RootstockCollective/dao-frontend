import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { Interface } from 'ethers'
import { useMemo } from 'react'
import { parseEventLogs } from 'viem'
import { ADDRESS_PADDED_BYTES } from '@/app/proposals/shared/utils'

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

export type BimProposalMap = Record<
  BimProposalCachedEvent['builder'],
  Record<string, BimProposalCachedEvent['event']>
>

export type ProposalQueryResult<Data> = Omit<Partial<UseQueryResult<Data>>, 'isLoading'> & {
  isLoading: boolean
}

export const useFetchCreateBuilderProposals = (): ProposalQueryResult<BimProposalMap> => {
  const { data: fetchedData, isLoading, error } = useFetchLatestProposals()

  const latestProposals = useMemo(() => {
    if (!fetchedData?.data) {
      return {} as BimProposalMap
    }

    const events = parseEventLogs({
      abi: GovernorAbi,
      logs: fetchedData.data,
      eventName: 'ProposalCreated',
    }) as CreateBuilderProposalEventLog[]

    // deduplicate
    const eventsMap = new Map(events.map(eventItem => [eventItem.args.proposalId, eventItem])).values()

    // why can't we use block number instead of timestamp which is not supported by the type?
    const sortedEvents = Array.from(eventsMap).sort(({ timeStamp: a }, { timeStamp: b }) => b - a)
    const bimProposalMap = sortedEvents.reduce<BimProposalMap>((acc, event) => {
      const bimEventCalldatas = event.args.calldatas.find(calldata =>
        calldata.startsWith(BIM_WHITELIST_FUNCTION_SELECTOR),
      )

      if (bimEventCalldatas) {
        const addressStart = BIM_WHITELIST_FUNCTION_SELECTOR.length + ADDRESS_PADDED_BYTES.length
        const addressEnd = addressStart + 40
        const builder = `0x${bimEventCalldatas.slice(addressStart, addressEnd)}`
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
  }, [fetchedData])

  return {
    data: latestProposals,
    isLoading: isLoading,
    error: error,
  }
}
