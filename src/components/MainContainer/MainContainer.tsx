'use client'

import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { ContainerDesktop } from './ContainerDesktop'
import ContainerMobile from './ContainerMobile'
import { MainContainerContent } from './MainContainerContent'
import { LayoutProvider } from './LayoutProvider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import Scroll from '../Scroll'
import { DelayedRender } from '../DelayedRender'

export const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  const isDesktop = useIsDesktop()
  return (
    <DelayedRender>
      <LayoutProvider>
        <MainContainerContent>
          <Scroll />
          {isDesktop ? (
            <ContainerDesktop>{children}</ContainerDesktop>
          ) : (
            <ContainerMobile>{children}</ContainerMobile>
          )}
        </MainContainerContent>
      </LayoutProvider>
    </DelayedRender>
  )
}
