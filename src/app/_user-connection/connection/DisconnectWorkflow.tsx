'use client'
import { useModal } from '@/shared/hooks/useModal'
import { useAccount, useDisconnect } from 'wagmi'
import { AccountAddress } from '@/components/Header'
import { shortAddress } from '@/lib/utils'
import { DisconnectWalletModal } from '@/components/Modal/DisconnectWalletModal'

export const DisconnectWorkflow = () => {
  const modal = useModal()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <>
      <AccountAddress
        address={address}
        shortAddress={shortAddress(address)}
        onLogoutClick={modal.openModal}
      />
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
