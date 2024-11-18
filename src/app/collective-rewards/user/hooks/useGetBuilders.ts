import {
  BuilderInfo,
  BuilderStatus,
  BuilderStatusActive,
  BuilderStatusInProgress,
  BuilderStatusProposalCreatedMVP,
} from '@/app/collective-rewards/types'
import { useFetchCreateBuilderProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { useEffect, useMemo } from 'react'
import { Address, getAddress } from 'viem'
import { useReadContracts } from 'wagmi'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { BuilderStateStruct } from '@/app/collective-rewards/utils/getBuilderGauge'

export type BuilderLoader = {
  data?: BuilderInfo
  isLoading: boolean
  error: Error | null
}

export type BuildersLoader = Omit<BuilderLoader, 'data'> & {
  data: BuilderInfo[]
}

type BuilderStatusMap = Record<Address, BuilderStatus>

const EXCLUDED_BUILDER_STATUS = 'X'
type BuilderStatusWithExcluded = BuilderStatus | 'X'

const getCombinedBuilderStatus = (builderState: BuilderStateStruct): BuilderStatusWithExcluded => {
  // Destructure the relevant elements from builderState
  // TODO: we may need to review the logic
  const [activated, kycApproved, communityApproved, , revoked] = builderState

  if (revoked) {
    return BuilderStatusActive
  }

  if (activated && kycApproved && communityApproved) {
    return BuilderStatusActive
  }

  if (kycApproved || communityApproved) {
    return BuilderStatusInProgress
  }

  // Default case: used to filter out builders
  return EXCLUDED_BUILDER_STATUS
}

export const useGetBuilders = (): BuildersLoader => {
  /*
   * get Gauges
   * for each Gauge
   *    get Builder from Gauge
   *    get Builder state
   *    ignore the builder if paused or revoked (to be confirmed)
   */
  // get the gauges
  const { data: gauges, isLoading: gaugesLoading, error: gaugesError } = useGetGaugesArray('active')

  // get the builders for each gauge
  const gaugeToBuilderCalls = gauges?.map(
    gauge =>
      ({
        address: BackersManagerAddress,
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
  const builders = buildersResult?.map(builder => builder.result) as Address[]

  let builderToGauge = builders?.reduce(
    (acc, builder, index) => {
      acc[builder] = gauges![index]
      return acc
    },
    {} as Record<Address, Address>,
  )

  // get the builder state for each builder
  const builderStatesCalls = builders?.map(
    builder =>
      ({
        address: BackersManagerAddress,
        abi: BuilderRegistryAbi,
        functionName: 'builderState',
        args: [builder],
      }) as const,
  )
  const {
    data: builderStatesResult,
    isLoading: builderStatesLoading,
    error: builderStatesError,
  } = useReadContracts({ contracts: builderStatesCalls, query: { refetchInterval: AVERAGE_BLOCKTIME } })
  const builderStates = builderStatesResult?.map(({ result }) => result as BuilderStateStruct)

  const builderStatusMap = builders?.reduce<BuilderStatusMap>((acc, builder, index) => {
    const builderState = (builderStates?.[index] ?? []) as BuilderStateStruct
    const status = getCombinedBuilderStatus(builderState)
    if (status !== EXCLUDED_BUILDER_STATUS) {
      acc[builder] = status as BuilderStatus
    }

    return acc
  }, {})

  const {
    data: buildersProposalsMap,
    isLoading: builderProposalsMapLoading,
    error: builderProposalsMapError,
  } = useFetchCreateBuilderProposals()

  const data = useMemo(() => {
    return Object.entries(buildersProposalsMap ?? {}).map<BuilderInfo>(([builder, proposals]) => ({
      address: getAddress(builder),
      status:
        builderStatusMap && builder in builderStatusMap
          ? builderStatusMap[builder as Address] // V2
          : BuilderStatusProposalCreatedMVP, // MVP
      proposals: Object.values(proposals),
      gauge: builderToGauge?.[builder as Address],
    }))
  }, [builderStatusMap, buildersProposalsMap])

  const isLoading = builderProposalsMapLoading || builderStatesLoading || buildersLoading || gaugesLoading
  const error = builderProposalsMapError ?? builderStatesError ?? buildersError ?? gaugesError

  return {
    data,
    isLoading,
    error,
  }
}
