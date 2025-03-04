'use client'
import { useModal } from '@/shared/hooks/useModal'
import { useAccount, useDisconnect } from 'wagmi'
import { AccountAddress } from '@/components/Header'
import { shortAddress } from '@/lib/utils'
import { DisconnectWalletModal } from '@/components/Modal/DisconnectWalletModal'
import { Popover } from '@/components/Popover'

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
        contentSubcontainerClassName="w-full py-[16px] px-[24px] text-center rounded-none border-[#2D2D2D] cursor-pointer"
        content={<DisconnectButton onDisconnect={modal.openModal} />}
        trigger="click"
      >
        <AccountAddress address={address} shortAddress={shortAddress(address)} />
      </Popover>
      {modal.isModalOpened && (
        <DisconnectWalletModal
          onClose={modal.closeModal}
          onConfirm={handleDisconnect}
          onCancel={modal.closeModal}
          address={address}
        />
      )}
    </>
  )
}

interface DisconnectButtonProps {
  onDisconnect: () => void
}
const DisconnectButton = ({ onDisconnect }: DisconnectButtonProps) => (
  <div onClick={onDisconnect} className="font-bold tracking-[0.16px] text-[16px] font-rootstock-sans">
    Disconnect
  </div>
)
