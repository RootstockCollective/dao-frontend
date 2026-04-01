import './globals.css'

import { GoogleTagManager } from '@next/third-parties/google'
import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import Script from 'next/script'
import type { ReactNode } from 'react'
import { Suspense } from 'react'
import { cookieToInitialState } from 'wagmi'

import { MainContainer } from '@/components/MainContainer'
import { wagmiAdapterConfig } from '@/config'
import { GOOGLE_TAG_ID } from '@/lib/constants'

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

async function DynamicProviders({ children }: Readonly<Props>) {
  const initialState = cookieToInitialState(wagmiAdapterConfig, (await headers()).get('cookie'))
  return <ContextProviders initialState={initialState}>{children}</ContextProviders>
}

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html lang="en" data-theme="default">
      {process.env.NODE_ENV === 'development' && (
        <Script
          src="//unpkg.com/react-grab/dist/index.global.js"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
      )}
      <GoogleTagManager gtmId={`${GOOGLE_TAG_ID}`} />
      <body className={`${openSans.variable} font-sans`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GOOGLE_TAG_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <Suspense>
          <DynamicProviders>
            <MainContainer>{children}</MainContainer>
          </DynamicProviders>
        </Suspense>
      </body>
    </html>
  )
}
