'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react'
import useLocalStorageState from 'use-local-storage-state'

import { useFeatureFlags } from '@/shared/context/FeatureFlag'
import { useModal } from '@/shared/hooks/useModal'

import { SecurityNoticeModalContent } from './SecurityNoticeModalContent'

/**
 * Identifier for the current security incident notice.
 *
 * Bump this value whenever a new incident notice should be shown so that users
 * who previously dismissed an older notice see the new one again on startup.
 */
const INCIDENT_ID = 'rewards-distribution-2026-06'

const STORAGE_KEY = 'security-notice-dismissed'

interface SecurityNoticeContextValue {
  /**
   * Opens the security notice modal on-demand (e.g. when the user clicks
   * "Claim Rewards"). Always shows the modal, regardless of whether the startup
   * notice has already been dismissed.
   */
  showSecurityNotice: () => void
}

const SecurityNoticeContext = createContext<SecurityNoticeContextValue>({
  showSecurityNotice: () => {},
})

export const useSecurityNotice = () => useContext(SecurityNoticeContext)

/**
 * Provides the security incident notice across the app.
 *
 * - On startup it auto-opens once per incident (dismissal remembered via
 *   localStorage, keyed to {@link INCIDENT_ID}).
 * - Exposes {@link useSecurityNotice} so any action (e.g. claiming rewards) can
 *   surface the same notice on-demand.
 */
export const SecurityNoticeProvider = ({ children }: { children: ReactNode }) => {
  const { flags } = useFeatureFlags()
  const isEnabled = !!flags.security_notice
  const { isModalOpened, openModal, closeModal } = useModal()
  const [dismissedIncident, setDismissedIncident] = useLocalStorageState<string | null>(STORAGE_KEY, {
    defaultValue: null,
  })

  // Auto-show once per incident on app startup, only while the incident flag is on.
  useEffect(() => {
    if (isEnabled && dismissedIncident !== INCIDENT_ID) {
      openModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled, dismissedIncident])

  const showSecurityNotice = useCallback(() => {
    if (isEnabled) {
      openModal()
    }
  }, [isEnabled, openModal])

  const handleClose = useCallback(() => {
    setDismissedIncident(INCIDENT_ID)
    closeModal()
  }, [setDismissedIncident, closeModal])

  const value = useMemo(() => ({ showSecurityNotice }), [showSecurityNotice])

  return (
    <SecurityNoticeContext.Provider value={value}>
      {children}
      {isModalOpened && <SecurityNoticeModalContent onClose={handleClose} />}
    </SecurityNoticeContext.Provider>
  )
}
