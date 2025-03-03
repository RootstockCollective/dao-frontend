'use client'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { PowerOffIcon } from '../Icons'
import { CopyButton } from '../CopyButton'

interface Props {
  address: string | undefined
  shortAddress: string
  onLogoutClick?: () => void
}

export const AccountAddress = ({ address, shortAddress, onLogoutClick }: Props) => {
  return (
    <div className="flex justify-between gap-2 items-center text-base">
      <div className="rounded-full bg-white">{address && <Jdenticon size="24" value={address} />}</div>
      <CopyButton copyText={address ?? ''} icon={null}>
        <span className="underline underline-offset-1">{shortAddress}</span>
      </CopyButton>
      <PowerOffIcon
        onClick={onLogoutClick}
        id="logOut"
        data-testid="Logout_Icon"
        className="cursor-pointer"
      />
    </div>
  )
}
