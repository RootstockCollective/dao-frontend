import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { BalancesProvider } from './contexts/BalancesContext'

export const metadata: Metadata = {
  title: 'RootstockCollective — My Holdings',
}

export default function Layout({ children }: PropsWithChildren) {
  return <BalancesProvider>{children}</BalancesProvider>
}
