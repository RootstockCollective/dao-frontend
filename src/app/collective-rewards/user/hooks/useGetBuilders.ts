import { useGetIsWhitelistedBuilder, useGetWhitelistedBuilders } from '@/app/collective-rewards/user/hooks'
import { BuilderInfo } from '@/app/collective-rewards/types'
import { useFetchCreateBuilderProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useMemo } from 'react'
import { Address, getAddress, isAddressEqual } from 'viem'

export type BuilderLoader = {
  data?: BuilderInfo
  isLoading: boolean
  error: Error | null
}

export type BuildersLoader = Omit<BuilderLoader, 'data'> & {
  data: BuilderInfo[]
}

export const useGetBuilderByAddress = (address: Address): BuilderLoader => {
  const {
    data: buildersProposalsMap,
    isLoading: builderProposalsMapLoading,
    error: builderProposalsMapError,
  } = useFetchCreateBuilderProposals()

  const {
    data: isWhitelistedBuilder,
    isLoading: isWhitelistedBuilderLoading,
    error: isWhitelistedBuilderError,
  } = useGetIsWhitelistedBuilder(address)

  const data = useMemo(() => {
    if (buildersProposalsMap) {
      const proposals = buildersProposalsMap?.[address] ?? {}

      return {
        address,
        status: isWhitelistedBuilder ? 'Whitelisted' : 'In progress',
        proposals: Object.values(proposals),
      } as BuilderInfo
    }
  }, [buildersProposalsMap, address, isWhitelistedBuilder])

  const isLoading = builderProposalsMapLoading || isWhitelistedBuilderLoading
  const error = builderProposalsMapError ?? isWhitelistedBuilderError

  return {
    data,
    isLoading,
    error,
  }
}

export const useGetBuilders = (): BuildersLoader => {
  const {
    data: buildersProposalsMap,
    isLoading: builderProposalsMapLoading,
    error: builderProposalsMapError,
  } = useFetchCreateBuilderProposals()
  const {
    data: whitelistedBuilders,
    isLoading: whitelistedBuildersLoading,
    error: whitelistedBuildersError,
  } = useGetWhitelistedBuilders()

  const data = useMemo(() => {
    return Object.entries(buildersProposalsMap ?? {}).map<BuilderInfo>(([builder, proposals]) => ({
      address: getAddress(builder),
      status: whitelistedBuilders?.some(whitelistedBuilder =>
        isAddressEqual(whitelistedBuilder, getAddress(builder)),
      )
        ? 'Whitelisted'
        : 'In progress',
      proposals: Object.values(proposals),
    }))
  }, [whitelistedBuilders, buildersProposalsMap])

  const isLoading = builderProposalsMapLoading || whitelistedBuildersLoading
  const error = builderProposalsMapError ?? whitelistedBuildersError

  return {
    data,
    isLoading,
    error,
  }
}
