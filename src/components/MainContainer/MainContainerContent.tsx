import { supportedChainId } from '@/config'
import { ENV } from '@/lib/constants'
import { usePathname } from 'next/navigation'
import { FC, ReactNode, useCallback, useEffect } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { Paragraph, Span } from '../Typography'
import { dismissToastAlerts, showToastAlert } from '@/shared/lib/toastAlert'

interface Props {
  children: ReactNode
}

export const MainContainerContent: FC<Props> = ({ children }) => {
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
      dismissToastAlerts()
    }
  }, [pathname, wrongNetwork])

  useEffect(() => {
    if (wrongNetwork) {
      console.error('Unsupported network', chainId)
      const networkName = ENV.charAt(0).toUpperCase() + ENV.slice(1)
      showToastAlert({
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
    }
  }, [chainId, handleSwitchNetwork, wrongNetwork])

  return isConnected && wrongNetwork ? null : children
}
