import { AccountAddress } from '@/components/Header/AccountAddress'
import { Logo } from '@/components/Header/Logo'

interface Props {
  address: string,
  shortAddress: string
}

export const Header = ({ address, shortAddress }: Props) => {
  return (
    <header className="m-2">
      <div className="flex justify-between p-4">
        <Logo />
        <AccountAddress address={address} shortAddress={shortAddress} />
      </div>
    </header>
  )
}
