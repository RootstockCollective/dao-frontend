'use client'
import { useState } from 'react'
import { Button } from '@/components/Button'
import { useLedger, LedgerConnectButton } from '@/shared/walletConnection'
import { useAccount, useSignMessage } from 'wagmi'
import { Paragraph } from '@/components/Typography'

/**
 * Demo component showcasing Ledger hardware wallet integration
 * This is for demonstration purposes and can be removed in production
 */
export const LedgerDemo = () => {
  const { address, isConnected, connector } = useAccount()
  const { signMessage, data: signature, isPending: isSigning } = useSignMessage()
  const [message, setMessage] = useState('Hello from Rootstock Collective!')

  const {
    isLedgerSupported,
    isLedgerConnected,
    deviceInfo,
    error,
    getLedgerInstructions,
  } = useLedger()

  const instructions = getLedgerInstructions()

  const handleSignMessage = () => {
    if (message.trim()) {
      signMessage({ message })
    }
  }

  const isConnectedWithLedger = isConnected && connector?.id === 'ledger'

  return (
    <div className="p-6 border border-gray-200 rounded-lg bg-white space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Ledger Hardware Wallet Demo</h3>
        <Paragraph variant="normal" className="text-sm text-gray-600">
          This demo showcases the Ledger hardware wallet integration features.
        </Paragraph>
      </div>

      {/* Connection Status */}
      <div className="space-y-2">
        <h4 className="font-medium">Connection Status</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span>Browser Supported:</span>
            <span className={isLedgerSupported ? 'text-green-600' : 'text-red-600'}>
              {isLedgerSupported ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>WebHID Support:</span>
            <span className={deviceInfo.isWebHIDSupported ? 'text-green-600' : 'text-gray-500'}>
              {deviceInfo.isWebHIDSupported ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>WebUSB Support:</span>
            <span className={deviceInfo.isWebUSBSupported ? 'text-green-600' : 'text-gray-500'}>
              {deviceInfo.isWebUSBSupported ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Ledger Connected:</span>
            <span className={isLedgerConnected ? 'text-green-600' : 'text-gray-500'}>
              {isLedgerConnected ? '✓' : '✗'}
            </span>
          </div>
        </div>
      </div>

      {/* Connection Instructions */}
      {!isLedgerSupported && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h5 className="font-medium text-yellow-800 mb-1">{instructions.title}</h5>
          <p className="text-sm text-yellow-700 mb-2">{instructions.message}</p>
          <ul className="text-sm text-yellow-700 list-disc list-inside">
            {instructions.actions.map((action, index) => (
              <li key={index}>{action}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <h5 className="font-medium text-red-800 mb-1">Connection Error</h5>
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Account Information */}
      {isConnectedWithLedger && address && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <h5 className="font-medium text-green-800 mb-1">Connected Account</h5>
          <p className="text-sm text-green-700 font-mono break-all">{address}</p>
          <p className="text-xs text-green-600 mt-1">
            Connected via {connector?.name} (Ledger Hardware Wallet)
          </p>
        </div>
      )}

      {/* Ledger Connect Button */}
      <div className="space-y-2">
        <h4 className="font-medium">Connection Controls</h4>
        <div className="flex gap-2">
          <LedgerConnectButton />
          
          {/* Regular AppKit button for comparison */}
          <appkit-button />
        </div>
      </div>

      {/* Message Signing Demo */}
      {isConnectedWithLedger && (
        <div className="space-y-2">
          <h4 className="font-medium">Message Signing Demo</h4>
          <div className="space-y-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter message to sign..."
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
            <Button
              onClick={handleSignMessage}
              disabled={!message.trim() || isSigning}
            >
              {isSigning ? 'Signing...' : 'Sign Message with Ledger'}
            </Button>
            
            {signature && (
              <div className="p-2 bg-gray-50 border rounded">
                <p className="text-xs font-medium mb-1">Signature:</p>
                <p className="text-xs font-mono break-all text-gray-600">{signature}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Development Info */}
      <div className="text-xs text-gray-500 border-t pt-2">
        <p>
          This is a demo component located at{' '}
          <code className="bg-gray-100 px-1 rounded">src/components/Demo/LedgerDemo.tsx</code>
        </p>
        <p>Remove this component in production builds.</p>
      </div>
    </div>
  )
}

export default LedgerDemo 