import type { Metadata } from 'next'
import './globals.css'
import { ContextProviders } from './providers'
import { kkTopo, openSans } from '@/styles/fonts'

export const metadata: Metadata = {
  title: 'DAO',
  description: 'DAO dApp',
}

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html lang="en" data-theme="default">
      <body className={`${openSans.variable} ${kkTopo.variable} font-sans`}>
        <ContextProviders>{children}</ContextProviders>
      </body>
    </html>
  )
}
