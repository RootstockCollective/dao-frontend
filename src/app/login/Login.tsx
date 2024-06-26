import { Button } from '@/components/Button'
import { Footer } from '@/components/Footer'
import { Logo } from '@/components/Header/Logo'
import classNames from 'classnames'
import { FaLink, FaUsers } from 'react-icons/fa6'
import { useAccount, useDisconnect } from 'wagmi'
import { WalletOptions } from './WalletOptions'

const BACKGROUND_CLASSES = 'bg-[url(../../public/images/login-bg.svg)] bg-cover'

export function Account() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <div>
      <div>{address}</div>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}

function ConnectWallet() {
  const { isConnected } = useAccount()
  if (isConnected) return <Account />
  return <WalletOptions />
}

export const Login = () => {
  const handleConnectWallet = () => {}
  const handleExploreCommunities = () => {}

  return (
    <div className={classNames(BACKGROUND_CLASSES, 'flex flex-col justify-center items-center h-screen')}>
      <Logo className="mb-8" />
      <div className="flex space-x-4">
        <Button onClick={handleConnectWallet} variant="primary" startIcon={<FaLink />}>
          Connect wallet
        </Button>
        <Button onClick={handleExploreCommunities} variant="secondary" startIcon={<FaUsers />}>
          Explore Communities
        </Button>
        <ConnectWallet />
      </div>
      <Footer />
    </div>
  )
}
