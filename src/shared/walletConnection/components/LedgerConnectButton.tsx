import { useState } from 'react'
import { Button } from '@/components/Button'
import { useLedger } from '@/shared/hooks/useLedger'
import { Tooltip } from '@/components/Tooltip'

interface LedgerConnectButtonProps {
  variant?: 'primary' | 'secondary' | 'white'
  className?: string
  children?: React.ReactNode
}

export const LedgerConnectButton = ({
  variant = 'primary',
  className,
  children = 'Connect Ledger',
}: LedgerConnectButtonProps) => {
  const {
    isLedgerSupported,
    isLedgerConnected,
    isConnecting,
    error,
    connectLedger,
    disconnectLedger,
    getLedgerInstructions,
    clearError,
  } = useLedger()

  const [showInstructions, setShowInstructions] = useState(false)
  const instructions = getLedgerInstructions()

  const handleClick = async () => {
    if (isLedgerConnected) {
      await disconnectLedger()
      return
    }

    if (!isLedgerSupported) {
      setShowInstructions(true)
      return
    }

    clearError()
    await connectLedger()
  }

  const buttonText = (() => {
    if (isConnecting) return 'Connecting...'
    if (isLedgerConnected) return 'Disconnect Ledger'
    return children
  })()

  const isDisabled = isConnecting || (!isLedgerSupported && !showInstructions)

  const buttonContent = (
    <Button
      onClick={handleClick}
      variant={variant}
      className={`${className} ${!isLedgerSupported ? 'opacity-50' : ''}`}
      disabled={isDisabled}
      data-testid="LedgerConnectButton"
    >
      <div className="flex items-center gap-2">
        {isConnecting && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        <span>{buttonText}</span>
      </div>
    </Button>
  )

  if (!isLedgerSupported || error) {
    return (
      <div className="relative">
        <Tooltip text={instructions.message}>{buttonContent}</Tooltip>

        {(showInstructions || error) && (
          <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">{instructions.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{instructions.message}</p>
              </div>

              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Steps to connect:</h5>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                  {instructions.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ol>
              </div>

              <div className="flex gap-2 pt-2">
                {error && (
                  <Button
                    onClick={() => {
                      clearError()
                      connectLedger()
                    }}
                    variant="primary"
                  >
                    Try Again
                  </Button>
                )}
                <Button onClick={() => setShowInstructions(false)} variant="white">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return buttonContent
}

export default LedgerConnectButton
