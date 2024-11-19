import '@/app/globals.css'
import { AppProps } from 'next/app'
import { ContextProviders } from '@/app/providers'
import { DeviceWarning } from '@/components/DeviceWarning'

const App = ({ Component, pageProps }: AppProps) => (
  <ContextProviders>
    <DeviceWarning />
    <Component {...pageProps} />
  </ContextProviders>
)

export default App
