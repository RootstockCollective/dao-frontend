import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ContextProviders } from './providers'
import { wagmiInitialState } from '@/config'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
})

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
      <body className={`${openSans.variable} font-sans`}>
        <ContextProviders initialState={wagmiInitialState}>{children}</ContextProviders>
      </body>
    </html>
  )
}
