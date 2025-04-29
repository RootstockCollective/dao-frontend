import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ContextProviders } from './providers'
import { GoogleTagManager } from '@next/third-parties/google'
import { GOOGLE_TAG_ID } from '@/lib/constants'
import { cookieToInitialState } from 'wagmi'
import { headers } from 'next/headers'
import { wagmiAdapterConfig } from '@/config'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RootstockCollective',
  description: 'RootstockCollective DAO dApp',
}

interface Props {
  children: ReactNode
}

export default async function RootLayout({ children }: Readonly<Props>) {
  const initialState = cookieToInitialState(wagmiAdapterConfig, (await headers()).get('cookie'))
  return (
    <html lang="en" data-theme="default">
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
        <ContextProviders initialState={initialState}>{children}</ContextProviders>
      </body>
    </html>
  )
}
