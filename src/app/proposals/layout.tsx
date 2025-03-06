import { Metadata } from 'next'
import { PropsWithChildren } from 'react'

export const metadata: Metadata = {
  title: 'RootstockCollective — Proposals',
}

export default function Layout({ children }: PropsWithChildren) {
  return <div className="container">{children}</div>
}
