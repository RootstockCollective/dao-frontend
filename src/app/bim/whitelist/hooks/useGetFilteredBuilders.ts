import { useEffect, useMemo, useState } from 'react'
import { BuilderStatus } from '@/app/bim/types'
import { BuilderStatusFilter } from '@/app/bim/whitelist/WhitelistContext'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'
import { ProposalState } from '@/shared/hooks/useVoteOnProposal'
import { DateTime } from 'luxon'
import { useGetProposalsState } from '@/app/bim/whitelist/hooks/useGetProposalsState'

type FetchWhitelistedBuildersFilter = {
  builderName: string
  status: BuilderStatusFilter
}

export type BuilderProposal = {
  name: string
  status: BuilderStatus
  address: string
  proposalId: bigint
  proposalDescription: string
  joiningDate: string
}

const lowerCaseCompare = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase())

export const useGetFilteredBuilders = ({
  builderName,
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
    return builders.reduce<BuilderProposal[]>((acc, { address, proposals, status }) => {
      const proposal = proposals.find(({ args: { proposalId } }) => {
        const state = proposalsStateMap[proposalId.toString()]

        const invalidStates = [ProposalState.Canceled, ProposalState.Defeated, ProposalState.Expired]

        return !invalidStates.includes(state)
      })

      if (proposal) {
        const {
          args: { proposalId, description },
          timeStamp,
        } = proposal
        const joiningDate = DateTime.fromSeconds(+timeStamp).toFormat('MMMM dd, yyyy')
        const [name, proposalDescription] = description.split(';')
        acc.push({ name, status, address, proposalId, proposalDescription, joiningDate })
      }

      return acc
    }, [])
  }, [builders, proposalsStateMap])

  useEffect(() => {
    let filteredData = filteredBuilders

    if (builderName) {
      filteredData = filteredData.filter(
        ({ name, address }) => lowerCaseCompare(name, builderName) || lowerCaseCompare(address, builderName),
      )
    }

    if (filterStatus !== 'all') {
      filteredData = filteredData.filter(builder => builder.status === filterStatus)
    }

    setData(filteredData)
  }, [filteredBuilders, builderName, filterStatus])

  const isLoading = buildersLoading || proposalsStateMapLoading
  const error = buildersError ?? proposalsStateMapError

  return {
    data,
    isLoading,
    error,
  }
}
