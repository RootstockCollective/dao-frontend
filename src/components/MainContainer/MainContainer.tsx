'use client'

import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { ContainerDesktop } from './ContainerDesktop'
import ContainerMobile from './ContainerMobile'
import { MainContainerContent } from './MainContainerContent'
import { LayoutProvider } from './LayoutProvider'

export const MainContainer: FC<PropsWithChildren> = ({ children }) => {
  const isDesktop = useMediaQuery({ minWidth: 640 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null
  return (
    <LayoutProvider>
      <MainContainerContent>
        {isDesktop ? (
          <ContainerDesktop>{children}</ContainerDesktop>
        ) : (
          <ContainerMobile>{children}</ContainerMobile>
        )}
      </MainContainerContent>
    </LayoutProvider>
  )
}
