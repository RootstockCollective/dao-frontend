import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ContextProviders } from './providers'
import { GoogleTagManager } from '@next/third-parties/google'

const openSans = Open_Sans({
  variable: '--font-open-sans',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RootstockCollective',
  description: 'RootstockCollective DAO dApp',
}

interface Props {
  children: React.ReactNode
}

export default function RootLayout({ children }: Readonly<Props>) {
  return (
    <html lang="en" data-theme="default">
      <GoogleTagManager gtmId="GTM-PTL6VZMT" />
      <body className={`${openSans.variable} font-sans`}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PTL6VZMT"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          ></iframe>
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        <ContextProviders>{children}</ContextProviders>
      </body>
    </html>
  )
}
