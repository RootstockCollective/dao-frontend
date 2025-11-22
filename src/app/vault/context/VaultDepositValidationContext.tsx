'use client'

import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useCanDepositToVault } from '../hooks/useCanDepositToVault'

interface VaultDepositValidationContextType {
  canDeposit: boolean
  isLoading: boolean
  error: Error | null | undefined
  reason?: string
  maxDefaultDepositLimit: string
}

const initialContextState: VaultDepositValidationContextType = {
  canDeposit: true,
  isLoading: true,
  error: null,
  reason: undefined,
  maxDefaultDepositLimit: '0',
}

const VaultDepositValidationContext = createContext<VaultDepositValidationContextType>(initialContextState)

export const useVaultDepositValidation = (): VaultDepositValidationContextType => {
  const context = useContext(VaultDepositValidationContext)
  if (context === undefined) {
    throw new Error('useVaultDepositValidation must be used within a VaultDepositValidationProvider')
  }
  return context
}

interface VaultDepositValidationProviderProps {
  children: ReactNode
}

export const VaultDepositValidationProvider = ({ children }: VaultDepositValidationProviderProps) => {
  const { canDeposit, isLoading, error, reason, maxDefaultDepositLimit } = useCanDepositToVault()

  const value = useMemo(
    () => ({
      canDeposit,
      isLoading,
      error,
      reason,
      maxDefaultDepositLimit,
    }),
    [canDeposit, isLoading, error, reason, maxDefaultDepositLimit],
  )

  return (
    <VaultDepositValidationContext.Provider value={value}>{children}</VaultDepositValidationContext.Provider>
  )
}
