import Image from 'next/image'
import { useAccount } from 'wagmi'
import { Tooltip } from '@/components/Tooltip'
import connectIcon from '../icons/connect.png'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'

/**
 * Temporary connect button. Replace with the real one
 */
export function TemporaryConnect() {
  const { isConnected } = useAccount()
  return <>{!isConnected && <ConnectWorkflow ConnectComponent={ConnectButton} />}</>
}

const ConnectButton = ({ onClick }: { onClick: () => void }) => (
  <Tooltip text="Connect wallet">
    <Image src={connectIcon} alt="Connect wallet" className="cursor-pointer" onClick={onClick} />
  </Tooltip>
)
