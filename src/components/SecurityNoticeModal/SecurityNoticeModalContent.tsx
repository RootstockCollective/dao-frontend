'use client'

import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Header, Paragraph, Span } from '@/components/Typography'

interface Props {
  onClose: () => void
}

/**
 * Presentational content of the security incident notice. Kept separate from the
 * trigger logic so it can be reused both on app startup and on-demand (e.g. when
 * the user clicks "Claim Rewards").
 */
export const SecurityNoticeModalContent = ({ onClose }: Props) => (
  <Modal width={600} onClose={onClose} data-testid="security-notice-modal">
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <Header variant="h3" caps data-testid="security-notice-title">
        Security Notice
      </Header>
      <Paragraph className="text-text-60" data-testid="security-notice-description">
        Due to a security incident, the distribution of rewards has been affected and is temporarily paused.
        Our team is investigating and working on a solution. Your funds require no action on your part. We
        will keep you informed.
      </Paragraph>
      <div className="flex justify-end">
        <Button variant="primary" onClick={onClose} data-testid="security-notice-confirm-button">
          <Span bold>Got it</Span>
        </Button>
      </div>
    </div>
  </Modal>
)
