'use client'
import { useModal } from '@/shared/hooks/useModal'
import { useAccount, useDisconnect } from 'wagmi'
import { AccountAddress } from '@/components/Header'
import { shortAddress } from '@/lib/utils'
import { DisconnectWalletModal } from '@/components/Modal/DisconnectWalletModal'
import { Popover } from '@/components/Popover'
import { DisconnectButton } from '@/lib/walletConnection/components/DisconnectButton'

/**
 * Component in charge of disconnecting the user
 * @constructor
 */
export const DisconnectWorkflow = () => {
  const modal = useModal()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <>
      <Popover
        contentContainerClassName="w-[145px]"
        contentSubContainerClassName="w-full py-[16px] px-[24px] text-center rounded-none border-[#2D2D2D] cursor-pointer select-none"
        contentSubcontainerProps={{ onClick: modal.openModal }}
        content={<DisconnectButton />}
        trigger="click"
      >
        <AccountAddress address={address} shortAddress={shortAddress(address)} withCopy={false} />
      </Popover>
      {modal.isModalOpened && (
        <DisconnectWalletModal
          onClose={modal.closeModal}
          onConfirm={handleDisconnect}
          onCancel={modal.closeModal}
        />
      )}
    </>
  )
}
