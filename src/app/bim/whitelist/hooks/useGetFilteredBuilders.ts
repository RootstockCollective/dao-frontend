import { useEffect, useMemo, useState } from 'react'
import { BuilderStatus } from '@/app/bim/types'
import { BuilderStatusFilter } from '@/app/bim/whitelist/WhitelistContext'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'
import { DateTime } from 'luxon'
import { useGetProposalsState } from '@/app/bim/whitelist/hooks/useGetProposalsState'
import { getMostAdvancedProposal } from '@/app/bim/utils/getMostAdvancedProposal'
import { splitCombinedName } from '@/app/proposals/shared/utils'

type FetchWhitelistedBuildersFilter = {
  builderName: string
  status: BuilderStatusFilter
}

export type BuilderProposal = {
  displayName: string
  status: BuilderStatus
  address: string
  proposalId: bigint
  proposalName: string
  proposalDescription: string
  joiningDate: string
}

const lowerCaseCompare = (a: string, b: string) => a?.toLowerCase().includes(b?.toLowerCase())

export const useGetFilteredBuilders = ({
  builderName: filterBuilderName,
  status: filterStatus,
}: FetchWhitelistedBuildersFilter) => {
  const [data, setData] = useState<BuilderProposal[]>([])
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useGetBuilders()
  const buildersProposals = builders.flatMap(({ proposals }) => proposals)
  const {
    data: proposalsStateMap,
    isLoading: proposalsStateMapLoading,
    error: proposalsStateMapError,
  } = useGetProposalsState(buildersProposals)

  const filteredBuilders = useMemo(() => {
    return builders.reduce<BuilderProposal[]>((acc, builder) => {
      const { status, address } = builder
      const proposal = getMostAdvancedProposal(builder, proposalsStateMap)

      if (proposal) {
        const {
          args: { proposalId, description },
          timeStamp,
        } = proposal
        const joiningDate = DateTime.fromSeconds(+timeStamp).toFormat('MMMM dd, yyyy')
        const [name, proposalDescription] = description.split(';')
        const { proposalName, builderName } = splitCombinedName(name)
        acc.push({
          displayName: builderName,
          status,
          address,
          proposalId,
          proposalName,
          proposalDescription,
          joiningDate,
        })
      }

      return acc
    }, [])
  }, [builders, proposalsStateMap])

  useEffect(() => {
    let filteredData = filteredBuilders

    if (filterBuilderName) {
      filteredData = filteredData.filter(
        ({ displayName: builderName, address }) =>
          // TODO: Here we filter by both name and address,
          // but the address is not displayed in the UI when the Builder name is present.
          lowerCaseCompare(builderName, filterBuilderName) || lowerCaseCompare(address, filterBuilderName),
      )
    }

    if (filterStatus !== 'all') {
      filteredData = filteredData.filter(builder => builder.status === filterStatus)
    }

    setData(filteredData)
  }, [filteredBuilders, filterBuilderName, filterStatus])

  const isLoading = buildersLoading || proposalsStateMapLoading
  const error = buildersError ?? proposalsStateMapError

  return {
    data,
    isLoading,
    error,
  }
}
