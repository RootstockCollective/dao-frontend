'use client'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { CopyButton } from '../CopyButton'
import { ChevronDown } from 'lucide-react'

interface Props {
  address: string | undefined
  shortAddress: string
  onLogoutClick?: () => void
  withCopy?: boolean
}

/**
 *
 * @param address
 * @param shortAddress
 * @param onLogoutClick
 * @param withCopy indicates whether the address can be copied or not
 * @constructor
 */
export const AccountAddress = ({ address, shortAddress, onLogoutClick, withCopy = true }: Props) => {
  return (
    <div className="flex justify-between gap-2 items-center text-base cursor-pointer">
      <div className="rounded-full bg-white">{address && <Jdenticon size="24" value={address} />}</div>
      {withCopy ? (
        <CopyButton copyText={address ?? ''} icon={null}>
          <span className="underline underline-offset-1">{shortAddress}</span>
        </CopyButton>
      ) : (
        <span className="underline underline-offset-1 select-none">{shortAddress}</span>
      )}
      <ChevronDown size={16} onClick={onLogoutClick} id="logOut" data-testid="Logout_Icon" />
    </div>
  )
}
