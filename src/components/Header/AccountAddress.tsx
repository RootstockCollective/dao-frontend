import { Jdenticon } from '@/components/Header/Jdenticon'
import { FaPowerOff } from 'react-icons/fa6'

interface Props {
  address: string | undefined
  shortAddress: string
  onLogoutClick?: () => void
}

export const AccountAddress = ({ address, shortAddress, onLogoutClick }: Props) => {
  return (
    <div className="flex justify-between items-center text-base">
      {address && (
        <div className="mr-2 rounded-full bg-white">
          <Jdenticon size="24" value={address} />
        </div>
      )}
      {shortAddress && <div className="mr-2 underline underline-offset-1">{shortAddress}</div>}
      <FaPowerOff onClick={onLogoutClick} id="logOut" data-testid="Logout_Icon" />
    </div>
  )
}
