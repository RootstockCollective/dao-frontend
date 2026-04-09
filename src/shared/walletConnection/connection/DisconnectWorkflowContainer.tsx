'use client'
import { useContext } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

import { AllocationsContext } from '@/app/collective-rewards/allocations/context'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useSiweStore } from '@/lib/auth/siweStore'
import { shortAddress } from '@/lib/utils'
import { useModal } from '@/shared/hooks/useModal'

import { DisconnectWorkflowPresentation } from './DisconnectWorkflowPresentation'

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
    actions: { resetAllocations },
  } = useContext(AllocationsContext)
  const signOut = useSiweStore(state => state.signOut)

  const handleDisconnect = () => {
    disconnect()
    signOut()
    resetAllocations()
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
