'use client'
import { useModal } from '@/shared/hooks/useModal'
import { useAccount, useDisconnect } from 'wagmi'
import { shortAddress } from '@/lib/utils'
import { DisconnectWorkflowPresentation } from './DisconnectWorkflowPresentation'

/**
 * Container component in charge of disconnecting the user logic
 * @constructor
 */
export const DisconnectWorkflowContainer = () => {
  const modal = useModal()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <DisconnectWorkflowPresentation
      address={address}
      shortAddress={shortAddress(address)}
      isModalOpened={modal.isModalOpened}
      onOpenModal={modal.openModal}
      onCloseModal={modal.closeModal}
      onDisconnect={handleDisconnect}
    />
  )
}
