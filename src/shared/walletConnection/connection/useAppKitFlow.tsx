'use client'

import { useContext } from 'react'
import { ConnectWalletContext } from './ConnectWalletProvider'

export const useAppKitFlow = () => {
  const context = useContext(ConnectWalletContext)

  if (context === undefined) {
    throw new Error('useAppKitFlow must be used within a ConnectWalletProvider')
  }

  return context
}
