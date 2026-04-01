'use client'

import { createContext, useContext } from 'react'
import { Proposal } from '../shared/types'
import { useGetProposalsWithGraph } from '../hooks/useGetProposalsWithGraph'

interface ProposalsContextType {
  proposals: Proposal[]
  loading: boolean
  error: Error | null
  activeProposalCount: string
  totalProposalCount: string
}

export const ProposalsContext = createContext<ProposalsContextType>({
  proposals: [],
  loading: false,
  error: null,
  activeProposalCount: '0',
  totalProposalCount: '0',
})

/**
 * This context is used to provide the proposals data to the app.
 * @param children - The children components to be wrapped by the provider.
 * @returns
 */
export const ProposalsProvider = ({ children }: { children: React.ReactNode }) => {
  const { data, loading, error, activeProposalCount, totalProposalCount } = useGetProposalsWithGraph()

  return (
    <ProposalsContext.Provider
      value={{ proposals: data, loading, error, activeProposalCount, totalProposalCount }}
    >
      {children}
    </ProposalsContext.Provider>
  )
}

export const useProposalsContext = () => {
  const context = useContext(ProposalsContext)

  if (!context) {
    throw new Error('useProposalsContext must be used within a ProposalsProvider')
  }

  return context
}

export const useProposalById = (proposalId: string) => {
  const { proposals } = useContext(ProposalsContext)

  return proposals.find(p => p.proposalId === proposalId)
}
