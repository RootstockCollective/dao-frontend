import { FC, ReactNode, useCallback, useEffect, useState } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { LoadingSpinner } from '../LoadingSpinner'
import { ConnectWalletModal } from '../Modal/ConnectWalletModal'
import { useAlertContext } from '@/app/providers'
import { ENV } from '@/lib/constants'
import { Paragraph, Span } from '../Typography'
import { supportedChainId } from '@/config'

interface Props {
  children: ReactNode
}

export const ProtectedContent: FC<Props> = ({ children }) => {
  const { isConnected, isConnecting, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const [hasMounted, setHasMounted] = useState(false)
  const { setMessage } = useAlertContext()

  useEffect(() => {
    // This is to prevent Hydration error on client side
    // because useAccount hook is not available on server side
    setHasMounted(true)
  }, [])

  const handleSwithNetwork = useCallback(() => {
    console.log('changing network...')
    switchChain({ chainId: supportedChainId })
  }, [switchChain])

  const wrongNetwork = chainId !== supportedChainId
  useEffect(() => {
    if (wrongNetwork) {
      console.error('Unsupported network', chainId)
      const networkName = ENV.charAt(0).toUpperCase() + ENV.slice(1)
      setMessage({
        title: 'Unsupported network',
        content: (
          <Paragraph variant="light" className="font-[600] text-[14px] text-white opacity-80 mb-[12px]">
            Please switch to RSK {networkName}.{' '}
            <Span className="underline cursor-pointer text-[14px]" onClick={handleSwithNetwork}>
              Switch network
            </Span>
          </Paragraph>
        ),
        severity: 'error',
        onDismiss: null,
      })
    } else {
      setMessage(null)
    }
  }, [chainId, handleSwithNetwork, setMessage, wrongNetwork])

  if (!hasMounted || isConnecting) {
    return <LoadingSpinner />
  }

  if (!isConnected) {
    return <ConnectWalletModal />
  }

  if (wrongNetwork) {
    return null
  }

  return <>{isConnected ? children : <ConnectWalletModal />}</>
}
