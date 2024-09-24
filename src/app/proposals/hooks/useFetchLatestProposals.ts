import { useMemo } from 'react'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { parseEventLogs } from 'viem'
import { GovernorAbi } from '@/lib/abis/Governor'
import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { Interface } from 'ethers'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'

export const useFetchLatestProposals = () => {
  const { data } = useQuery({
    queryFn: fetchProposalsCreatedCached,
    queryKey: ['proposalsCreated'],
    refetchInterval: 2000,
  })

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

export type BimProposalCachedEvent = {
  event: EventLog
  builder: string
}

export type BimProposalMap = Record<
  BimProposalCachedEvent['builder'],
  Record<string, BimProposalCachedEvent['event']>
>

export const useFetchLatestBIMProposals = (): UseQueryResult<BimProposalMap> => {
  const queryResult = useQuery({
    queryFn: async () => {
      const fetchedData = await fetchProposalsCreatedCached()

      if (!fetchedData?.data) {
        return {} as BimProposalMap
      }

      const events = parseEventLogs({
        abi: GovernorAbi,
        logs: fetchedData.data,
        eventName: 'ProposalCreated',
      })

      // deduplicate
      const eventsMap = new Map(events.map(eventItem => [eventItem.args.proposalId, eventItem])).values()

      // why can't we use block number instead of timestamp which is not supported by the type?
      const sortedEvents = Array.from(eventsMap).sort(
        (a, b) =>
          (b as unknown as { timeStamp: number }).timeStamp -
          (a as unknown as { timeStamp: number }).timeStamp,
      )

      const bimProposalMap = sortedEvents.reduce<BimProposalMap>((acc, event) => {
        const bimEventCalldatas = event.args.calldatas.find(calldata =>
          calldata.startsWith(BIM_WHITELIST_FUNCTION_SELECTOR),
        )

        if (bimEventCalldatas) {
          const addressStart = BIM_WHITELIST_FUNCTION_SELECTOR.length
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
    },
    queryKey: ['bimProposalCreated'],
    refetchInterval: 30_000,
  })

  return queryResult as UseQueryResult<BimProposalMap>
}
