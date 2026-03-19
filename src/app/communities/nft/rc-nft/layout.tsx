import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Rootcamp NFT',
}

export default function RcNftLayout({ children }: { children: ReactNode }) {
  return children
}
