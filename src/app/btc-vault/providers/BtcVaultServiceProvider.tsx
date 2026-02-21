'use client'

import { createContext, ReactNode, useEffect, useRef } from 'react'
import { createBtcVaultService, type BtcVaultService } from '../services'

export const BtcVaultServiceContext = createContext<BtcVaultService | null>(null)

interface BtcVaultServiceProviderProps {
  children: ReactNode
}

export const BtcVaultServiceProvider = ({ children }: BtcVaultServiceProviderProps) => {
  const serviceRef = useRef<BtcVaultService | null>(null)

  if (serviceRef.current === null) {
    serviceRef.current = createBtcVaultService()
  }

  useEffect(() => {
    return () => {
      serviceRef.current?.dispose()
      serviceRef.current = null
    }
  }, [])

  return (
    <BtcVaultServiceContext.Provider value={serviceRef.current}>{children}</BtcVaultServiceContext.Provider>
  )
}
