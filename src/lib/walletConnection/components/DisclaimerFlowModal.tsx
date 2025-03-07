import { ConfirmationModal } from '@/components/Modal'
import { disclaimerModalText } from '@/lib/walletConnection'
import { DisclaimerFlowProps } from '@/lib/walletConnection/types'

/**
 * Shows the modal with the disclaimer text and triggers the onAgree callback when the user agrees.
 * @param onAgree
 * @param onClose
 * @constructor
 */
export const DisclaimerFlow = ({ onAgree, onClose }: DisclaimerFlowProps) => {
  return (
    <ConfirmationModal
      title={disclaimerModalText.modalTitle}
      isOpen
      onClose={onClose}
      onDecline={onClose}
      onAccept={onAgree}
    >
      {disclaimerModalText.modalDescription}
    </ConfirmationModal>
  )
}
