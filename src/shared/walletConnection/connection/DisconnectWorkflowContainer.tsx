'use client'
import { useModal } from '@/shared/hooks/useModal'
import { useAccount, useDisconnect } from 'wagmi'
import { shortAddress } from '@/lib/utils'
import { DisconnectWorkflowPresentation } from './DisconnectWorkflowPresentation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'

/**
 * Container component in charge of disconnecting the user logic
 * @constructor
 */
export const DisconnectWorkflowContainer = () => {
  const modal = useModal()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { closeDrawer, isDrawerOpen } = useLayoutContext()

  const handleDisconnect = () => {
    disconnect()
    if (isDrawerOpen) {
      closeDrawer()
    }
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
