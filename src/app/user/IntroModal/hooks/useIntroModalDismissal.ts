import { useCallback } from 'react'
import { useAccount } from 'wagmi'

import { CHAIN_ID, ONE_DAY_IN_MS } from '@/lib/constants'

import { INTRO_MODAL_REMIND_AFTER_DAYS, IntroModalStatus } from '../config'

const INTRO_MODAL_DISMISSALS_KEY = 'intro-modal-dismissals'

/** Last close timestamp (ms) per step */
type Dismissals = Partial<Record<IntroModalStatus, number>>

const getStorageKey = (walletAddress: string) =>
  `${INTRO_MODAL_DISMISSALS_KEY}-${CHAIN_ID}-${walletAddress.toLowerCase()}`

const readDismissals = (key: string): Dismissals => {
  try {
    const stored = localStorage.getItem(key)
    const parsed = stored ? JSON.parse(stored) : null

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    // Unreadable or malformed: treat as never closed
    return {}
  }
}

/**
 * Remembers, per wallet and step, when the holder closed the intro modal.
 * A closed step stays hidden for INTRO_MODAL_REMIND_AFTER_DAYS; other steps still show.
 */
export const useIntroModalDismissal = () => {
  const { address } = useAccount()
  const key = address ? getStorageKey(address) : null

  const isDismissed = useCallback(
    (status: IntroModalStatus) => {
      if (!key) return false

      const dismissedAt = readDismissals(key)[status]
      if (typeof dismissedAt !== 'number') return false

      const elapsed = Date.now() - dismissedAt
      // Negative means the clock moved back: treat as expired
      return elapsed >= 0 && elapsed < INTRO_MODAL_REMIND_AFTER_DAYS * ONE_DAY_IN_MS
    },
    [key],
  )

  const dismiss = useCallback(
    (status: IntroModalStatus) => {
      if (!key) return

      try {
        const dismissals: Dismissals = { ...readDismissals(key), [status]: Date.now() }
        localStorage.setItem(key, JSON.stringify(dismissals))
      } catch {
        // Ignore storage errors: the dismissal just won't persist
      }
    },
    [key],
  )

  return { isDismissed, dismiss }
}
