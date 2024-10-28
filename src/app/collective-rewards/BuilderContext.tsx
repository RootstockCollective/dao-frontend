import { createContext, FC, ReactNode, useContext, useMemo } from 'react'
import { Address } from 'viem'
import { BuilderStatus } from '@/app/collective-rewards/types'
import { useGetProposalsState } from '@/app/collective-rewards/whitelist/hooks/useGetProposalsState'
import { useGetBuilders } from './hooks'
import { getMostAdvancedProposal } from '@/app/collective-rewards/utils/getMostAdvancedProposal'
import { DateTime } from 'luxon'
import { splitCombinedName } from '@/app/proposals/shared/utils'
import { withPricesContextProvider } from '@/shared/context/PricesContext'

export type BuilderProposal = {
  builderName: string
  status: BuilderStatus
  address: Address
  proposalId: bigint
  proposalName: string
  proposalDescription: string
  joiningDate: string
}

type ProposalByBuilder = Record<Address, BuilderProposal>

type BuilderContextValue = {
  data: BuilderProposal[]
  isLoading: boolean
  error: Error | null
  useGetBuilderByAddress: (address: Address) => BuilderProposal | undefined
}

export const BuilderContext = createContext<BuilderContextValue>({
  data: [],
  isLoading: false,
  error: null,
  useGetBuilderByAddress: () => ({}) as BuilderProposal,
})

interface BuilderProviderProps {
  children: ReactNode
}

export const BuilderContextProvider: FC<BuilderProviderProps> = ({ children }) => {
  const { data: builders, isLoading: buildersLoading, error: buildersError } = useGetBuilders()
  const buildersProposals = builders.flatMap(({ proposals }) => proposals)
  const {
    data: proposalsStateMap,
    isLoading: proposalsStateMapLoading,
    error: proposalsStateMapError,
  } = useGetProposalsState(buildersProposals)

  const filteredBuilders = useMemo(() => {
    return builders.reduce<ProposalByBuilder>((acc, builder) => {
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
        acc[address] = {
          builderName,
          status,
          address,
          proposalId,
          proposalName,
          proposalDescription,
          joiningDate,
        }
      }

      return acc
    }, {})
  }, [builders, proposalsStateMap])

  const isLoading = buildersLoading || proposalsStateMapLoading
  const error = buildersError ?? proposalsStateMapError

  const useGetBuilderByAddress = (address: Address): BuilderProposal | undefined => {
    return filteredBuilders[address]
  }

  const valueOfContext: BuilderContextValue = {
    data: Object.values(filteredBuilders),
    isLoading,
    error,
    useGetBuilderByAddress,
  }

  return <BuilderContext.Provider value={valueOfContext}>{children}</BuilderContext.Provider>
}

export const useBuilderContext = () => useContext(BuilderContext)

export const withBuilderContextProvider = <P extends object>(Component: FC<P>) => {
  return function WrapperComponent(props: P) {
    return (
      <BuilderContextProvider>
        <Component {...props} />
      </BuilderContextProvider>
    )
  }
}

export const BuilderContextProviderWithPrices = withPricesContextProvider(BuilderContextProvider)
