import { useCallback, useEffect, useState } from 'react'
import { useConnect, useAccount, useDisconnect } from 'wagmi'
import TransportWebUSB from '@ledgerhq/hw-transport-webusb'
import TransportWebHID from '@ledgerhq/hw-transport-webhid'

interface LedgerState {
  isLedgerSupported: boolean
  isLedgerConnected: boolean
  isConnecting: boolean
  error: string | null
  deviceInfo: {
    isWebHIDSupported: boolean
    isWebUSBSupported: boolean
  }
}

export function useLedger() {
  const { connectors, connect, isPending } = useConnect()
  const { isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()

  const [ledgerState, setLedgerState] = useState<LedgerState>({
    isLedgerSupported: false,
    isLedgerConnected: false,
    isConnecting: false,
    error: null,
    deviceInfo: {
      isWebHIDSupported: false,
      isWebUSBSupported: false,
    },
  })

  // Check for Ledger support on mount
  useEffect(() => {
    const checkLedgerSupport = async () => {
      try {
        const isWebHIDSupported = await TransportWebHID.isSupported()
        const isWebUSBSupported = await TransportWebUSB.isSupported()
        const isLedgerSupported = isWebHIDSupported || isWebUSBSupported

        setLedgerState(prev => ({
          ...prev,
          isLedgerSupported,
          deviceInfo: {
            isWebHIDSupported,
            isWebUSBSupported,
          },
        }))
      } catch (error) {
        console.warn('Error checking Ledger support:', error)
        setLedgerState(prev => ({
          ...prev,
          isLedgerSupported: false,
          error: 'Failed to check Ledger support',
        }))
      }
    }

    checkLedgerSupport()
  }, [])

  // Update connection status
  useEffect(() => {
    const isLedgerConnected = isConnected && connector?.id === 'ledger'
    setLedgerState(prev => ({
      ...prev,
      isLedgerConnected,
      isConnecting: isPending && connector?.id === 'ledger',
    }))
  }, [isConnected, connector, isPending])

  const connectLedger = useCallback(async () => {
    try {
      setLedgerState(prev => ({ ...prev, error: null, isConnecting: true }))

      const ledgerConnector = connectors.find(c => c.id === 'ledger')
      if (!ledgerConnector) {
        throw new Error('Ledger connector not found')
      }

      await connect({ connector: ledgerConnector })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect to Ledger'
      setLedgerState(prev => ({
        ...prev,
        error: errorMessage,
        isConnecting: false,
      }))
    }
  }, [connectors, connect])

  const disconnectLedger = useCallback(async () => {
    try {
      if (connector?.id === 'ledger') {
        await disconnect()
      }
    } catch (error) {
      console.warn('Error disconnecting Ledger:', error)
    }
  }, [disconnect, connector])

  const clearError = useCallback(() => {
    setLedgerState(prev => ({ ...prev, error: null }))
  }, [])

  const getLedgerInstructions = useCallback(() => {
    if (!ledgerState.isLedgerSupported) {
      return {
        title: 'Ledger Not Supported',
        message:
          'Your browser does not support Ledger hardware wallets. Please use Chrome, Edge, or another Chromium-based browser.',
        actions: ['Update your browser', 'Try a different browser'],
      }
    }

    if (ledgerState.error) {
      if (ledgerState.error.includes('Ethereum app')) {
        return {
          title: 'Open Ethereum App',
          message: 'Please unlock your Ledger device and open the Ethereum app.',
          actions: ['Unlock your Ledger device', 'Open the Ethereum app', 'Try connecting again'],
        }
      }

      if (ledgerState.error.includes('transport')) {
        return {
          title: 'Connection Issue',
          message: 'Unable to connect to your Ledger device. Please check the connection.',
          actions: ['Check USB connection', 'Try a different USB port', 'Restart the browser'],
        }
      }

      return {
        title: 'Connection Error',
        message: ledgerState.error,
        actions: ['Try again', 'Check device connection'],
      }
    }

    return {
      title: 'Connect Ledger',
      message: 'Connect your Ledger hardware wallet to securely interact with the Rootstock Collective.',
      actions: ['Unlock your Ledger device', 'Open the Ethereum app', 'Click connect'],
    }
  }, [ledgerState])

  return {
    ...ledgerState,
    connectLedger,
    disconnectLedger,
    clearError,
    getLedgerInstructions,
    isLoading: isPending,
  }
}
