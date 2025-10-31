'use client'

import { useAppKit } from '@reown/appkit/react'
import { createContext, useState, ReactNode } from 'react'
import { parseWalletConnectionError } from '../utils'
import { showToast } from '@/shared/notification'
import { DisclaimerFlow } from '@/shared/walletConnection/components/DisclaimerFlowModal'

interface ConnectWalletContextType {
  handleConnectWallet: () => void
  handleCloseIntermediateStep: () => void
  onConnectWalletButtonClick: () => void
}

export const ConnectWalletContext = createContext<ConnectWalletContextType | undefined>(undefined)

interface ConnectWalletProviderProps {
  children: ReactNode
}

export const ConnectWalletProvider = ({ children }: ConnectWalletProviderProps) => {
  const [intermediateStep, setIntermediateStep] = useState<boolean>(false)
  const { open } = useAppKit()

  const handleConnectWallet = () => {
    try {
      open()
    } catch (err) {
      setIntermediateStep(false)
      showToast({
        title: 'Failed to connect to wallet',
        content: parseWalletConnectionError(err),
        severity: 'error',
      })
    }
  }

  const handleCloseIntermediateStep = () => {
    setIntermediateStep(false)
  }

  const onConnectWalletButtonClick = () => {
    setIntermediateStep(true)
  }

  const value: ConnectWalletContextType = {
    handleConnectWallet,
    handleCloseIntermediateStep,
    onConnectWalletButtonClick,
  }

  return (
    <ConnectWalletContext.Provider value={value}>
      {children}
      {!!intermediateStep && (
        <DisclaimerFlow onAgree={handleConnectWallet} onClose={handleCloseIntermediateStep} />
      )}
    </ConnectWalletContext.Provider>
  )
}
