'use client'

import { createContext, ReactNode, useContext, useMemo } from 'react'
import { useCanDepositToVault } from '../hooks/useCanDepositToVault'

interface VaultDepositValidationContextType {
  canDeposit: boolean
  isLoading: boolean
  error: Error | null | undefined
  maxDepositLimit: string
  reason?: string
}

const initialContextState: VaultDepositValidationContextType = {
  canDeposit: true,
  isLoading: true,
  error: null,
  reason: undefined,
  maxDepositLimit: '0',
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
  const { canDeposit, isLoading, error, reason, maxDepositLimit } = useCanDepositToVault()

  const value = useMemo(
    () => ({
      canDeposit,
      isLoading,
      error,
      reason,
      maxDepositLimit,
    }),
    [canDeposit, isLoading, error, reason, maxDepositLimit],
  )

  return (
    <VaultDepositValidationContext.Provider value={value}>{children}</VaultDepositValidationContext.Provider>
  )
}
