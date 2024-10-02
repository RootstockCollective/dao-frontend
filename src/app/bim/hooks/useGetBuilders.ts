import { useGetWhitelistedBuilders } from '@/app/bim/hooks/useGetWhitelistedBuilders'
import { BuilderInfo } from '@/app/bim/types'
import { useFetchCreateBuilderProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { useMemo } from 'react'
import { Address, isAddressEqual } from 'viem'

export const useGetBuilders = () => {
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
      name: 'Builder',
      address: builder,
      status: whitelistedBuilders?.some(whitelistedBuilder =>
        isAddressEqual(whitelistedBuilder, builder as Address),
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
