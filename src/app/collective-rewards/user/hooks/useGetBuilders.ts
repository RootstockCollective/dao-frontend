import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { getMostAdvancedProposal, removeBrackets } from '@/app/collective-rewards/utils'
import { RawBuilderState } from '@/app/collective-rewards/utils/getBuilderGauge'
import { useGetProposalsState } from '@/app/collective-rewards/user'
import { useFetchCreateBuilderProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { splitCombinedName } from '@/app/proposals/shared/utils'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { Address, getAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { useMigrationContext } from '@/shared/context/MigrationContext'

export type UseGetBuilders = () => {
  data: Record<Address, Builder> // TODO review Builder type
  isLoading: boolean
  // TODO: review error type
  error: Error | null
}

export const useGetBuilders: UseGetBuilders = () => {
  const { builderRegistryAddress } = useMigrationContext()

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

  // get the builders for each gauge
  const gaugeToBuilderCalls = gauges?.map(
    gauge =>
      ({
        address: builderRegistryAddress,
        abi: BuilderRegistryAbi,
        functionName: 'gaugeToBuilder',
        args: [gauge],
      }) as const,
  )
  const {
    data: buildersResult,
    isLoading: buildersLoading,
    error: buildersError,
  } = useReadContracts<Address[]>({
    contracts: gaugeToBuilderCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
  const builders = useMemo(
    () => buildersResult?.map(builder => builder.result) as Address[],
    [buildersResult],
  )

  const builderToGauge = useMemo(
    () =>
      builders?.reduce<Record<Address, Address>>((acc, builder, index) => {
        acc[builder] = gauges![index]
        return acc
      }, {}),
    [builders, gauges],
  )

  // get the builder state for each builder
  const builderStatesCalls = useMemo(
    () =>
      builders?.map(
        builder =>
          ({
            address: builderRegistryAddress,
            abi: BuilderRegistryAbi,
            functionName: 'builderState',
            args: [builder],
          }) as const,
      ),
    // disable the eslint rule because we don't need to call it again
    // when the builderRegistryAddress changes
    // to avoid multiple calls in a short period of time
    [builders], // eslint-disable-line react-hooks/exhaustive-deps
  )
  const {
    data: builderStatesResult,
    isLoading: builderStatesLoading,
    error: builderStatesError,
  } = useReadContracts({ contracts: builderStatesCalls, query: { refetchInterval: AVERAGE_BLOCKTIME } })

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
    const builderStates = builderStatesResult?.map(({ result }) => result as RawBuilderState)

    const statusByBuilder =
      builders?.reduce<Record<Address, BuilderStateFlags>>((acc, builder, index) => {
        const builderState = (builderStates?.[index] ?? [
          false,
          false,
          false,
          false,
          false,
          '',
          '',
        ]) as RawBuilderState
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
  }, [proposalsByBuilder, builderToGauge, builderStatesResult, proposalsStateMap, builders])

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
