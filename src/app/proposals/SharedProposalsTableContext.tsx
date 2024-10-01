import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useBlockNumber } from 'wagmi'

interface SharedProposalsTableContextProps {
  latestBlockNumber?: bigint
}

const SharedProposalsTableContext = createContext<SharedProposalsTableContextProps>({
  latestBlockNumber: undefined,
})

interface SharedProposalsTableContextProviderProps {
  children: ReactNode
}

export const SharedProposalsTableContextProvider = ({
  children,
}: SharedProposalsTableContextProviderProps) => {
  const { data: latestBlockNumber } = useBlockNumber()

  const value = useMemo(
    () => ({
      latestBlockNumber,
    }),
    [latestBlockNumber],
  )

  return <SharedProposalsTableContext.Provider value={value}>{children}</SharedProposalsTableContext.Provider>
}

export const useSharedProposalsTableContext = () => useContext(SharedProposalsTableContext)
