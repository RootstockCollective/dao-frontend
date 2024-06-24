import { AccountAddress } from '@/components/Header/AccountAddress'

interface Props {
  address: string,
  shortAddress: string
  onLogoutClick?: () => void
}

export const Header = ({ address, shortAddress, onLogoutClick }: Props) => {
  return (
    <header className="m-2">
      <div className="flex justify-end p-4">
        <AccountAddress address={address} shortAddress={shortAddress} onLogoutClick={onLogoutClick} />
      </div>
    </header>
  )
}
