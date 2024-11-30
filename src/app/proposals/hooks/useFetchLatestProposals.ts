import { fetchProposalsCreatedCached } from '@/app/user/Balances/actions'
import { GovernorAbi } from '@/lib/abis/Governor'
import { SimplifiedRewardDistributorAbi } from '@/lib/abis/SimplifiedRewardDistributorAbi'
import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { Interface, type InterfaceAbi } from 'ethers'
import { useMemo } from 'react'
import { getAddress, parseEventLogs } from 'viem'
import { ADDRESS_PADDING_LENGTH, RELAY_PARAMETER_PADDING_LENGTH } from '@/app/proposals/shared/utils'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
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
          // @ts-expect-error
          .sort((a, b) => b.timeStamp - a.timeStamp)
      )
    }
    return []
  }, [data])

  return { latestProposals }
}

export type LatestProposalResponse = ReturnType<typeof useFetchAllProposals>['latestProposals'][number]

interface FunctionSelectorArgs {
  functionName: string
  abi: InterfaceAbi
}

const toFunctionSelector = ({ functionName, abi }: FunctionSelectorArgs) => {
  const selector = new Interface(abi).getFunction(functionName)?.selector
  if (!selector) {
    throw new Error(`Function ${functionName} not found in abi.`)
  }
  return selector
}

const RELAY_FUNCTION_SELECTOR = toFunctionSelector({ abi: GovernorAbi, functionName: 'relay' })
const CR_WHITELIST_FUNCTION_SELECTOR_MVP = toFunctionSelector({
  abi: SimplifiedRewardDistributorAbi,
  functionName: 'whitelistBuilder', // v1
})

const CR_WHITELIST_FUNCTION_SELECTOR_V2 = toFunctionSelector({
  abi: BuilderRegistryAbi,
  functionName: 'communityApproveBuilder',
})

type ElementType<T> = T extends Array<infer U> ? U : never

type EventLog = ElementType<ReturnType<typeof parseEventLogs<typeof GovernorAbi, true, 'ProposalCreated'>>>
export type CreateBuilderProposalEventLog = EventLog & { timeStamp: number }

export interface CrProposalCachedEvent {
  event: CreateBuilderProposalEventLog
  builder: string
}

export type ProposalsPerBuilder = Record<CrProposalCachedEvent['builder'], CreateBuilderProposalEventLog[]>

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
    isLoading,
    error,
  }
}
