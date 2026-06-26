'use client'

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo } from 'react'

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

// Read/write the dismissal flag directly from localStorage (client-only). We
// avoid useLocalStorageState here on purpose: its value hydrates to the default
// on the first render, which would race the startup effect and re-open the
// modal on every reload even after the user dismissed it.
const isIncidentDismissed = (): boolean =>
  typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY) === INCIDENT_ID

const markIncidentDismissed = (): void => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, INCIDENT_ID)
  }
}

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

  // Auto-show once per incident on app startup, only while the incident flag is
  // on and the user hasn't dismissed it. Runs after mount, so localStorage is
  // available and reflects the real persisted value.
  useEffect(() => {
    if (isEnabled && !isIncidentDismissed()) {
      openModal()
    }
  }, [isEnabled, openModal])

  const showSecurityNotice = useCallback(() => {
    if (isEnabled) {
      openModal()
    }
  }, [isEnabled, openModal])

  const handleClose = useCallback(() => {
    markIncidentDismissed()
    closeModal()
  }, [closeModal])

  const value = useMemo(() => ({ showSecurityNotice }), [showSecurityNotice])

  return (
    <SecurityNoticeContext.Provider value={value}>
      {children}
      {isModalOpened && <SecurityNoticeModalContent onClose={handleClose} />}
    </SecurityNoticeContext.Provider>
  )
}
