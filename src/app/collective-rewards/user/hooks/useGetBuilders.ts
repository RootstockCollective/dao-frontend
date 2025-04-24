import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useGetProposalsState } from '@/app/collective-rewards/user'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { getMostAdvancedProposal, removeBrackets } from '@/app/collective-rewards/utils'
import { useFetchCreateBuilderProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { splitCombinedName } from '@/app/proposals/shared/utils'
import { useReadBuilderRegistryForMultipleArgs } from '@/shared/hooks/contracts/collective-rewards/useReadBuilderRegistryForMultipleArgs'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { Address, getAddress, zeroAddress } from 'viem'

export type UseGetBuilders = () => {
  data: Record<Address, Builder> // TODO review Builder type
  isLoading: boolean
  // TODO: review error type
  error: Error | null
}

export const useGetBuilders: UseGetBuilders = () => {
  /*
   * // TODO: we're missing builder with KYC only on v2
   * get Gauges
   * for each Gauge
   *    get Builder from Gauge
   *    get Builder state
   *    ignore the builder if paused or revoked (to be confirmed)
   */
  // get the gauges
  const { data: gauges, isLoading: gaugesLoading, error: gaugesError } = useGetGaugesArray()

  const {
    data: builders,
    isLoading: buildersLoading,
    error: buildersError,
  } = useReadBuilderRegistryForMultipleArgs({
    functionName: 'gaugeToBuilder',
    args: useMemo(() => gauges?.map(gauge => [gauge] as const) ?? [], [gauges]),
  })

  if (!gaugesLoading && !buildersLoading && builders.length !== gauges.length) {
    console.error(
      'The number of builders and gauges do not match. This is not expected. Please reload the page.',
      builders,
      gauges,
    )
  }

  const builderToGauge = useMemo(
    () =>
      builders?.reduce<Record<Address, Address>>((acc, builder, index) => {
        if (!builder) return acc

        acc[builder] = gauges![index]
        return acc
      }, {}),
    [builders, gauges],
  )

  const {
    data: builderStates,
    isLoading: builderStatesLoading,
    error: builderStatesError,
  } = useReadBuilderRegistryForMultipleArgs({
    functionName: 'builderState',
    args: useMemo(() => builders?.map(builder => [builder ?? zeroAddress] as const) ?? [], [builders]),
  })

  // TODO: useFetchCreateBuilderProposals & useGetProposalsState & getMostAdvancedProposal can be joined
  const {
    data: proposalsByBuilder,
    isLoading: isLoadingProposalsByBuilder,
    error: proposalsByBuilderError,
  } = useFetchCreateBuilderProposals()

  const proposalIds = useMemo(
    () =>
      Object.values(proposalsByBuilder ?? {}).flatMap(events => events.map(({ args }) => args.proposalId)),
    [proposalsByBuilder],
  )

  const {
    data: proposalsStateMap,
    isLoading: proposalsStateMapLoading,
    error: proposalsStateMapError,
  } = useGetProposalsState(proposalIds)

  const data: Record<Address, Builder> = useMemo(() => {
    const statusByBuilder =
      builders?.reduce<Record<Address, BuilderStateFlags>>((acc, builder, index) => {
        if (!builder) return acc

        const builderState = builderStates?.[index] ?? [false, false, false, false, false, '', '']
        const [activated, kycApproved, communityApproved, paused, revoked] = builderState
        acc[builder] = { activated, kycApproved, communityApproved, paused, revoked }

        return acc
      }, {}) ?? ({} as Record<Address, BuilderStateFlags>)

    return Object.entries(proposalsByBuilder ?? {}).reduce<Record<Address, Builder>>(
      (acc, [key, proposalsEvent]) => {
        const address = getAddress(key)
        const proposal = getMostAdvancedProposal(proposalsEvent, proposalsStateMap, statusByBuilder[address])

        if (proposal) {
          const {
            args: { proposalId, description },
            timeStamp,
          } = proposal
          const joiningDate = DateTime.fromSeconds(+timeStamp).toFormat('MMMM dd, yyyy')
          const [name, proposalDescription] = description.split(';')
          const { proposalName, builderName } = splitCombinedName(name)
          acc[address] = {
            proposal: {
              id: proposalId,
              name: proposalName,
              description: proposalDescription,
              date: joiningDate,
            },
            stateFlags: statusByBuilder[address],
            gauge: builderToGauge && builderToGauge[address],
            address,
            builderName: removeBrackets(builderName),
          }
        }

        return acc
      },
      {},
    )
  }, [proposalsByBuilder, builderToGauge, builderStates, proposalsStateMap, builders])

  const isLoading =
    isLoadingProposalsByBuilder ||
    builderStatesLoading ||
    buildersLoading ||
    gaugesLoading ||
    proposalsStateMapLoading
  const error =
    proposalsByBuilderError ?? builderStatesError ?? buildersError ?? gaugesError ?? proposalsStateMapError

  return {
    data,
    isLoading,
    error,
  }
}
