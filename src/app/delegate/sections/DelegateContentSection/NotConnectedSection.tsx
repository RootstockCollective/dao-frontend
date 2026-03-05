import { WalletNotConnectedSection } from '@/components/WalletNotConnectedSection'

const DELEGATE_TITLE = 'Your wallet is not connected'
const DELEGATE_SUBTITLE = 'Select a delegate to make governance decisions on your behalf.'

export const NotConnectedSection = () => (
  <WalletNotConnectedSection title={DELEGATE_TITLE} subtitle={DELEGATE_SUBTITLE} />
)
