import './globals.css'

import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { headers } from 'next/headers'
import type { ReactNode } from 'react'
import { cookieToInitialState } from 'wagmi'

import { MainContainer } from '@/components/MainContainer'
import { wagmiAdapterConfig } from '@/config'
import { NonceProvider } from '@/shared/context/NonceContext'

import { ContextProviders } from './providers'

const openSans = localFont({
  src: './fonts/open-sans-latin-wght-normal.woff2',
  weight: '300 800',
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: 'RootstockCollective',
  description: 'RootstockCollective DAO dApp',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

interface Props {
  children: ReactNode
}

export default async function RootLayout({ children }: Readonly<Props>) {
  const requestHeaders = await headers()
  const initialState = cookieToInitialState(wagmiAdapterConfig, requestHeaders.get('cookie'))
  // Set by src/proxy.ts for page requests; inline scripts rendered by components need it to pass the CSP
  const nonce = requestHeaders.get('x-nonce') ?? undefined
  return (
    <html lang="en" data-theme="default" className={openSans.variable}>
      <body className="font-sans">
        <NonceProvider nonce={nonce}>
          <ContextProviders initialState={initialState}>
            <MainContainer>{children}</MainContainer>
          </ContextProviders>
        </NonceProvider>
      </body>
    </html>
  )
}
