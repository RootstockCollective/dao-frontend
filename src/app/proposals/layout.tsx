import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'RootstockCollective — Proposals',
}

export default function Layout({ children }: PropsWithChildren) {
  return <MainContainer>{children}</MainContainer>
}
