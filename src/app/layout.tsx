import './globals.css'

import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { cookieToInitialState } from 'wagmi'

import { MainContainer } from '@/components/MainContainer'
import { wagmiAdapterConfig } from '@/config'

import { ContextProviders } from './providers'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
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
  const initialState = cookieToInitialState(wagmiAdapterConfig, (await headers()).get('cookie'))
  return (
    <html lang="en" data-theme="default">
      {process.env.NODE_ENV === 'development' && (
        <Script
          src="//unpkg.com/react-grab/dist/index.global.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      )}
      <body className={`${openSans.variable} font-sans`}>
        <ContextProviders initialState={initialState}>
          <MainContainer>{children}</MainContainer>
        </ContextProviders>
      </body>
    </html>
  )
}
