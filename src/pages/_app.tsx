import '@/app/globals.css'
import { AppProps } from 'next/app'
import { ContextProviders } from '@/app/providers'

const App = ({ Component, pageProps }: AppProps) => (
  <ContextProviders>
    <Component {...pageProps} />
  </ContextProviders>
)

export default App
