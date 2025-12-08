import { ConfirmationModal } from '@/components/Modal'
import { Paragraph } from '@/components/Typography'
import { VAULT_TERMS_CONDITIONS_URL } from '@/lib/constants'
import { useVaultTermsAcceptance } from '../hooks/useVaultTermsAcceptance'
import { useState, useCallback, useEffect } from 'react'

const termsAndConditionsModalText = {
  modalTitle: 'DISCLAIMER',
  modalDescription: (
    <>
      <Paragraph>
        Please note that by interacting with the USD Sandbox Vault dApp, <br />
        you acknowledge that your access, deposits, and use of the Vault <br />
        are governed by the Sandbox Vault Terms & Conditions.
      </Paragraph>
      <br />
      <Paragraph>
        These Terms apply whether you are acting in your individual <br />
        capacity or as an authorized representative of a legal entity.
      </Paragraph>
      <br />
      <Paragraph>
        Please read the Terms & Conditions carefully before depositing <br />
        into the USD Sandbox Vault.
      </Paragraph>
      <br />
      <Paragraph>
        By proceeding, you confirm that you have read, understood, <br />
        and agree to be bound by these Terms.
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
          Terms & Conditions
        </a>
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
