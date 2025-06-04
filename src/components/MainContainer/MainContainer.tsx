'use client'
import { currentEnvChain } from '@/config'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { FC, PropsWithChildren } from 'react'
import { useAccount } from 'wagmi'
import { DelayedRender } from '../DelayedRender'
import Scroll from '../Scroll'
import { ContainerDesktop } from './ContainerDesktop'
import ContainerMobile from './ContainerMobile'
import { LayoutProvider } from './LayoutProvider'
import { ToastContainer } from 'react-toastify'

export const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  const isDesktop = useIsDesktop()
  const { isConnected, chainId } = useAccount()
  const wrongNetwork = chainId !== currentEnvChain.id
  const shouldDisplayContent = !isConnected || !wrongNetwork
  return (
    <DelayedRender>
      <LayoutProvider>
        <ToastContainer />
        {shouldDisplayContent && (
          <>
            <Scroll />
            {isDesktop ? (
              <ContainerDesktop>{children}</ContainerDesktop>
            ) : (
              <ContainerMobile>{children}</ContainerMobile>
            )}
          </>
        )}
      </LayoutProvider>
    </DelayedRender>
  )
}
