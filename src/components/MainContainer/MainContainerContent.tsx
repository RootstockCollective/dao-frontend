import { supportedChainId } from '@/config'
import { ENV } from '@/lib/constants'
import { FC, ReactNode, useCallback, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { Paragraph, Span } from '../Typography'
import { ProtectedContent } from '../ProtectedContent/ProtectedContent'
import { usePathname } from 'next/navigation'

interface Props {
  setMessage: (message: any) => void
  children: ReactNode
  isProtected?: boolean
}

export const MainContainerContent: FC<Props> = ({ isProtected = false, setMessage, children }) => {
  const { isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const pathname = usePathname()

  const handleSwitchNetwork = useCallback(() => {
    switchChain({ chainId: supportedChainId })
  }, [switchChain])

  const wrongNetwork = chainId && chainId !== supportedChainId

  useEffect(() => {
    // Clear message on route change if not on wrong network
    if (!wrongNetwork) {
      setMessage(null)
    }
  }, [pathname, setMessage, wrongNetwork])

  useEffect(() => {
    if (wrongNetwork) {
      console.error('Unsupported network', chainId)
      const networkName = ENV.charAt(0).toUpperCase() + ENV.slice(1)
      setMessage({
        title: 'Unsupported network',
        content: (
          <Paragraph variant="light" className="font-[600] text-[14px] text-white opacity-80 mb-[12px]">
            Please switch to RSK {networkName}.{' '}
            <Span className="underline cursor-pointer text-[14px]" onClick={handleSwitchNetwork}>
              Switch network
            </Span>
          </Paragraph>
        ),
        severity: 'error',
        onDismiss: null, // force not showing dismiss button
      })
    } else {
      setMessage(null)
    }
  }, [chainId, handleSwitchNetwork, setMessage, wrongNetwork])

  if (isConnected && wrongNetwork) {
    return null
  }

  return <>{isProtected ? <ProtectedContent>{children}</ProtectedContent> : children}</>
}
