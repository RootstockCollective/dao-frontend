'use client'
import { PropsWithChildren } from 'react'
import { ToastContainer } from 'react-toastify'
import { useAccount } from 'wagmi'

import { StepperProvider } from '@/app/proposals/components/stepper/StepperProvider'
import { currentEnvChain } from '@/config'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { DelayedRender } from '../DelayedRender'
import Scroll from '../Scroll'
import { ContainerDesktop } from './ContainerDesktop'
import ContainerMobile from './ContainerMobile'
import { LayoutProvider } from './LayoutProvider'

export const MainContainer = ({ children }: PropsWithChildren) => {
  const isDesktop = useIsDesktop()
  const { isConnected, chainId } = useAccount()
  const wrongNetwork = chainId !== currentEnvChain.id
  const shouldDisplayContent = !isConnected || !wrongNetwork
  return (
    <DelayedRender>
      <LayoutProvider>
        <ToastContainer />
        <StepperProvider>
          {shouldDisplayContent ? (
            <>
              <Scroll />
              {isDesktop ? (
                <ContainerDesktop key="container">{children}</ContainerDesktop>
              ) : (
                <ContainerMobile key="container">{children}</ContainerMobile>
              )}
            </>
          ) : null}
        </StepperProvider>
      </LayoutProvider>
    </DelayedRender>
  )
}
