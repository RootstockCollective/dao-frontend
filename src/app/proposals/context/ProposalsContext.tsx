import { createContext, ReactNode, useContext } from 'react'
import { useFetchLatestProposals } from '../hooks/useFetchLatestProposals'

interface ProposalsContextType {
  latestProposals: any[]
  isFetching: boolean
  refetch: () => void
}

const ProposalsContext = createContext<ProposalsContextType | undefined>(undefined)

export const ProposalsProvider = ({ children }: { children: ReactNode }) => {
  const { latestProposals, isLoading: isFetching, refetch } = useFetchLatestProposals()

  return (
    <ProposalsContext.Provider value={{ latestProposals, isFetching, refetch }}>
      {children}
    </ProposalsContext.Provider>
  )
}

export const useProposalsContext = () => {
  const context = useContext(ProposalsContext)
  if (context === undefined) {
    throw new Error('useProposalsContext must be used within a ProposalsProvider')
  }
  return context
}
