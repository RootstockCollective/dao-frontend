import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { cookieToInitialState } from 'wagmi'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ContextProviders } from './providers'
import { getConfig } from '@/config'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'DAO',
  description: 'DAO dApp',
}
// https://wagmi.sh/react/guides/ssr#_2-hydrate-the-cookie
const WAGMI_STATE_COOKIE = 'wagmi-state'
const wagmiInitialState = cookieToInitialState(getConfig(), headers().get(WAGMI_STATE_COOKIE))

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
