import '@/app/globals.css'
import { AppProps } from 'next/app'
import { ContextProviders } from '@/app/providers'
import { wagmiInitialState } from '@/config'

const App = ({ Component, pageProps }: AppProps) => (
  <ContextProviders initialState={wagmiInitialState}>
    <Component {...pageProps} />
  </ContextProviders>
)

export default App
