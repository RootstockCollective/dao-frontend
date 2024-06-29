import { AccountAddress } from '@/components/Header/AccountAddress'

interface Props {
  address: string | undefined
  shortAddress: string
  onLogoutClick?: () => void
}

export const Header = ({ address, shortAddress, onLogoutClick }: Props) => {
  return (
    <header className="container my-8">
      <div className="flex justify-end">
        <AccountAddress address={address} shortAddress={shortAddress} onLogoutClick={onLogoutClick} />
      </div>
    </header>
  )
}
