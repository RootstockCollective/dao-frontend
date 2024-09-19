'use client'
import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useFetchNFTsOwned } from '@/app/providers/hooks/useFetchNFTsOwned'
import { useAccount } from 'wagmi'

interface NFTContextProps {}
const NFTContext = createContext<NFTContextProps>({})

interface NFTContextProviderProps {
  nftAddress: string
  children: ReactNode
}
export const NFTContextProvider = ({ nftAddress, children }: NFTContextProviderProps) => {
  const { address } = useAccount()
  const data = useFetchNFTsOwned(address as string, nftAddress)
  const value = useMemo(() => ({ ...data }), [data])
  return <NFTContext.Provider value={value}>{children}</NFTContext.Provider>
}

export const useNFTContext = () => useContext(NFTContext)
