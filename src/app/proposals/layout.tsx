import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { ProposalsProvider } from './context'

export const metadata: Metadata = {
  title: 'RootstockCollective — Proposals',
}

export default function Layout({ children }: PropsWithChildren) {
  return <ProposalsProvider>{children}</ProposalsProvider>
}
