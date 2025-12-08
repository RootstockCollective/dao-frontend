import { ConfirmationModal } from '@/components/Modal'
import { Paragraph } from '@/components/Typography'
import { VAULT_TERMS_CONDITIONS_URL } from '@/lib/constants'
import { useVaultTermsAcceptance } from '../hooks/useVaultTermsAcceptance'
import { useState, useCallback, useEffect } from 'react'

const termsAndConditionsModalText = {
  modalTitle: 'TERMS & CONDITIONS',
  modalDescription: (
    <>
      <Paragraph>
        To continue with your deposit, you must agree to the Terms and Conditions for the USD Sandbox Vault.
      </Paragraph>
      <br />
      <Paragraph>
        Please read the{' '}
        <a
          href={VAULT_TERMS_CONDITIONS_URL || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="underline cursor-pointer"
          data-testid="TermsAndConditionsLink"
        >
          Terms and Conditions
        </a>{' '}
        carefully before proceeding.
      </Paragraph>
    </>
  ),
}

export interface TermsAndConditionsModalProps {
  onAgree: () => void
  onDecline?: () => void
  shouldShow: boolean
}

/**
 * Shows the modal with the Terms & Conditions text when shouldShow is true and user hasn't accepted terms.
 * Manages its own open/close state and integrates with the terms acceptance hook.
 * @param onAgree - Callback when user accepts the terms and modal closes
 * @param onDecline - Callback when user declines the terms and modal closes
 * @param shouldShow - Whether the modal should be shown (if terms not already accepted)
 * @constructor
 */
export const TermsAndConditionsModal = ({ onAgree, onDecline, shouldShow }: TermsAndConditionsModalProps) => {
  const { hasAcceptedTerms, acceptTerms } = useVaultTermsAcceptance()
  const [isOpen, setIsOpen] = useState(false)

  // Show modal when shouldShow is true and terms haven't been accepted
  const shouldShowModal = shouldShow && !hasAcceptedTerms

  // Update modal state when shouldShow changes
  useEffect(() => {
    if (shouldShowModal && !isOpen) {
      setIsOpen(true)
    }
  }, [shouldShowModal, isOpen])

  const handleAccept = useCallback(() => {
    acceptTerms()
    setIsOpen(false)
    onAgree()
  }, [acceptTerms, onAgree])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    onDecline?.()
  }, [onDecline])

  return (
    <ConfirmationModal
      title={termsAndConditionsModalText.modalTitle}
      isOpen={isOpen}
      onClose={handleClose}
      onDecline={handleClose}
      onAccept={handleAccept}
      data-testid="TermsAndConditionsModal"
    >
      {termsAndConditionsModalText.modalDescription}
    </ConfirmationModal>
  )
}
