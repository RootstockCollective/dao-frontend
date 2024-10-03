import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useGetProposalVotes } from '@/app/proposals/hooks/useGetProposalVotes'
import { useProposalState } from '@/shared/hooks/useProposalState'

interface ProposalsContextProps {
  proposalVotes: string[]
  name: string
  proposalId: string
  // Index of row rendered in table
  index: number
  // Status transformed to human-friendly string
  proposalStateHuman: string
  // Block in which the proposal was created
  blockNumber: string
}

const ProposalsContext = createContext<ProposalsContextProps>({
  proposalVotes: [],
  name: '',
  proposalId: '',
  index: 0,
  proposalStateHuman: '',
  blockNumber: '0',
})

interface ProposalsContextProviderProps {
  proposalId: string
  name: string
  index: number
  children: ReactNode
  blockNumber: string // HEX blockNumber
}

export const ProposalsContextProvider = ({
  proposalId,
  name,
  index,
  children,
  blockNumber,
}: ProposalsContextProviderProps) => {
  const proposalVotes = useGetProposalVotes(proposalId)
  const { proposalStateHuman } = useProposalState(proposalId, false)
  const value: ProposalsContextProps = useMemo(
    () => ({
      proposalVotes: proposalVotes,
      proposalId,
      name,
      index,
      proposalStateHuman,
      blockNumber,
    }),
    [proposalVotes, proposalId, name, index, proposalStateHuman, blockNumber],
  )
  return <ProposalsContext.Provider value={value}>{children}</ProposalsContext.Provider>
}

// Hook to use the ProposalsContext for an individual proposal
export const useProposalContext = () => {
  const context = useContext(ProposalsContext)
  if (context === undefined) {
    throw new Error('useProposal must be used within a ProposalsProvider')
  }
  return context
}
