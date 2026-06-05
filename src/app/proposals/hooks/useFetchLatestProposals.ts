import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { Log } from 'viem'
import { getAddress, parseEventLogs, prepareEncodeFunctionData } from 'viem'

import { fetchProposalsCreatedCached } from '@/app/proposals/actions/fetchProposalsCreatedCached'
import { ADDRESS_PADDING_LENGTH, RELAY_PARAMETER_PADDING_LENGTH } from '@/app/proposals/shared/utils'
import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { BuilderRegistryAbi } from '@/lib/abis/tok/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'

const useFetchLatestProposals = () => {
  return useQuery({
    queryFn: fetchProposalsCreatedCached,
    queryKey: ['proposalsCreated'],
    refetchInterval: AVERAGE_BLOCKTIME,
  })
}

export const useFetchAllProposals = () => {
  const { data } = useFetchLatestProposals()

  const latestProposals = useMemo(() => {
    if (data?.data) {
      const proposals = parseEventLogs({
        abi: GovernorAbi,
        logs: data.data as unknown as Log[],
        eventName: 'ProposalCreated',
      })

      // remove duplicates
      return (
        proposals
          .filter(
            (proposal, index, self) =>
              self.findIndex(p => p.args.proposalId === proposal.args.proposalId) === index,
          )
          // TODO: `timeStamp` no longer exists at runtime since DAO-2147 migrated to `toRpcLog` (viem `RpcLog` drops it).
          // This sort is currently a no-op (NaN comparator) — server-side sort by `blockNumber` in /proposals/api/route.ts
          // provides the correct order. Remove this sort + the `@ts-ignore` + the bogus `& { timeStamp: number }` on
          // `CreateBuilderProposalEventLog`, or sort by `blockNumber` here too.
          // @ts-ignore
          .sort((a, b) => b.timeStamp - a.timeStamp)
      )
    }
    return []
  }, [data])

  return { latestProposals }
}
export type LatestProposalResponse = ReturnType<typeof useFetchAllProposals>['latestProposals'][number]

const RELAY_FUNCTION_SELECTOR = prepareEncodeFunctionData({
  abi: GovernorAbi,
  functionName: 'relay',
}).functionName
const CR_WHITELIST_FUNCTION_SELECTOR_MVP = prepareEncodeFunctionData({
  abi: SimplifiedRewardDistributorAbi,
  functionName: 'whitelistBuilder', // v1
}).functionName

const CR_WHITELIST_FUNCTION_SELECTOR_V2 = prepareEncodeFunctionData({
  abi: BuilderRegistryAbi,
  functionName: 'communityApproveBuilder',
}).functionName

type ElementType<T> = T extends (infer U)[] ? U : never

type EventLog = ElementType<ReturnType<typeof parseEventLogs<typeof GovernorAbi, true, 'ProposalCreated'>>>
export type CreateBuilderProposalEventLog = EventLog & { timeStamp: number }

interface CrProposalCachedEvent {
  event: CreateBuilderProposalEventLog
  builder: string
}

type ProposalsPerBuilder = Record<CrProposalCachedEvent['builder'], CreateBuilderProposalEventLog[]>

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
      logs: fetchedData.data as unknown as Log[],
      eventName: 'ProposalCreated',
    }) as CreateBuilderProposalEventLog[]

    // deduplicate
    const eventsMap = new Map(events.map(eventItem => [eventItem.args.proposalId, eventItem])).values()

    // TODO: same issue as in `useFetchAllProposals` — `timeStamp` was dropped by `toRpcLog` in DAO-2147, so
    // `b - a` is `undefined - undefined` → NaN, making this sort a no-op. The /proposals/api/route.ts now sorts
    // by `blockNumber` server-side, but this client sort should either be removed or rewritten to use `blockNumber`.
    const sortedAndRelayFilteredEvents = Array.from(eventsMap)
      .sort(({ timeStamp: a }, { timeStamp: b }) => b - a)
      .filter(({ args: { calldatas } }) =>
        calldatas.find(calldata => calldata.startsWith(RELAY_FUNCTION_SELECTOR)),
      )
    const crProposalMap = sortedAndRelayFilteredEvents.reduce<ProposalsPerBuilder>((acc, event) => {
      const crWhitelistFunctionHashMVP = CR_WHITELIST_FUNCTION_SELECTOR_MVP.slice(2)
      const crWhitelistFunctionHashV2 = CR_WHITELIST_FUNCTION_SELECTOR_V2.slice(2)
      // both MVP and V2 have the same length
      const whitelistFnLength = crWhitelistFunctionHashV2.length
      const relayPadding = RELAY_FUNCTION_SELECTOR.length + RELAY_PARAMETER_PADDING_LENGTH
      const crEventCalldatas = event.args.calldatas.find(
        calldata =>
          calldata.startsWith(crWhitelistFunctionHashMVP, relayPadding) ||
          calldata.startsWith(crWhitelistFunctionHashV2, relayPadding),
      )

      if (crEventCalldatas) {
        const addressStart = relayPadding + whitelistFnLength + ADDRESS_PADDING_LENGTH
        const addressEnd = addressStart + 40
        const addressSlice = `0x${crEventCalldatas.slice(addressStart, addressEnd)}`
        let builder
        try {
          builder = getAddress(addressSlice)
        } catch (e) {
          console.error('useFetchCreateBuilderProposal:: Failed to parse builder address', e)
          return acc
        }
        const existingBuilder = acc[builder] || []

        acc = {
          ...acc,
          [builder]: [...existingBuilder, event],
        }
      }

      return acc
    }, {})

    return crProposalMap
  }, [fetchedData?.data])

  return {
    data: latestProposals,
    isLoading: isLoading,
    error: error,
  }
}
