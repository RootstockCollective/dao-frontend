'use client'

import { useEffect } from 'react'
import useLocalStorageState from 'use-local-storage-state'

import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Header, Paragraph, Span } from '@/components/Typography'
import { useModal } from '@/shared/hooks/useModal'

/**
 * Identifier for the current security incident notice.
 *
 * Bump this value whenever a new incident notice should be shown so that users
 * who previously dismissed an older notice see the new one again.
 */
const INCIDENT_ID = 'rewards-distribution-2026-06'

const STORAGE_KEY = 'security-notice-dismissed'

/**
 * Global modal shown on app startup to inform users about a security incident
 * affecting the rewards distribution. Once dismissed, it is remembered per
 * incident (via localStorage) so it is not shown again until a new incident is
 * published (see {@link INCIDENT_ID}).
 */
export const SecurityNoticeModal = () => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const [dismissedIncident, setDismissedIncident] = useLocalStorageState<string | null>(STORAGE_KEY, {
    defaultValue: null,
  })

  useEffect(() => {
    if (dismissedIncident !== INCIDENT_ID) {
      openModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissedIncident])

  const handleClose = () => {
    setDismissedIncident(INCIDENT_ID)
    closeModal()
  }

  if (!isModalOpened) {
    return null
  }

  return (
    <Modal width={600} onClose={handleClose} data-testid="security-notice-modal">
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
          <Button variant="primary" onClick={handleClose} data-testid="security-notice-confirm-button">
            <Span bold>Got it</Span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
