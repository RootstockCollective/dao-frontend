'use client'

import { useAppKit } from '@reown/appkit/react'
import { useState } from 'react'
import { parseWalletConnectionError } from '../utils'
import { showToast } from '@/shared/notification'

export const useAppKitFlow = () => {
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

  return {
    intermediateStep,
    handleConnectWallet,
    handleCloseIntermediateStep,
    onConnectWalletButtonClick,
  }
}
