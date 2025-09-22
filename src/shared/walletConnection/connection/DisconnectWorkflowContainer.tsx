'use client'
import { useModal } from '@/shared/hooks/useModal'
import { useAccount, useDisconnect } from 'wagmi'
import { shortAddress } from '@/lib/utils'
import { DisconnectWorkflowPresentation } from './DisconnectWorkflowPresentation'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useQueryClient } from '@tanstack/react-query'

/**
 * Container component in charge of disconnecting the user logic
 * @constructor
 */
export const DisconnectWorkflowContainer = () => {
  const modal = useModal()
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { closeDrawer } = useLayoutContext()

  const {
    invalidateQueries
  } = useQueryClient()



  const handleDisconnect = () => {
    disconnect()
    invalidateQueries()
    closeDrawer()
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
