import type { Metadata } from 'next'
import { Open_Sans } from 'next/font/google'
import './globals.css'
import { ContextProviders } from './providers'

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
      <body className={`${openSans.variable} font-sans`}>
        <ContextProviders>{children}</ContextProviders>
      </body>
    </html>
  )
}
