import { supportedChainId } from '@/config'
import { ENV } from '@/lib/constants'
import { showToastAlert } from '@/shared/lib/toastAlert'
import { usePathname } from 'next/navigation'
import { FC, ReactNode, useCallback, useEffect, useRef } from 'react'
import { Id, toast } from 'react-toastify'
import { useAccount, useSwitchChain } from 'wagmi'
import { Paragraph, Span } from '../Typography'

interface Props {
  children: ReactNode
}

export const MainContainerContent: FC<Props> = ({ children }) => {
  const { isConnected, chainId } = useAccount()
  const { switchChain } = useSwitchChain()
  const pathname = usePathname()
  const toastIdRef = useRef<Id | null>(null)

  const handleSwitchNetwork = useCallback(() => {
    switchChain({ chainId: supportedChainId })
  }, [switchChain])

  const wrongNetwork = chainId && chainId !== supportedChainId

  const dismissToastAlert = useCallback(() => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
      toastIdRef.current = null
    }
  }, [])

  useEffect(() => {
    // Clear message on route change if not on wrong network
    if (!wrongNetwork && toastIdRef.current) {
      dismissToastAlert()
    }
  }, [, pathname, wrongNetwork, dismissToastAlert])

  useEffect(() => {
    if (wrongNetwork) {
      console.error('Unsupported network', chainId)
      const networkName = ENV.charAt(0).toUpperCase() + ENV.slice(1)
      const toastId = showToastAlert({
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
        dismissible: false,
        dataTestId: 'UnsupportedNetwork',
      })

      toastIdRef.current = toastId
    } else if (toastIdRef.current) {
      // Dismiss the toast if the network is supported
      dismissToastAlert()
    }
  }, [chainId, wrongNetwork, dismissToastAlert, handleSwitchNetwork])

  return isConnected && wrongNetwork ? null : children
}
