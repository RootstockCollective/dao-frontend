'use client'
import { ProposalsProvider } from './context/ProposalsContext'

export default function ProposalsLayout({ children }: { children: React.ReactNode }) {
  return <ProposalsProvider>{children}</ProposalsProvider>
}
