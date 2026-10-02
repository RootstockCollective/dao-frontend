import { useCallback } from 'react'
import { useAccount } from 'wagmi'

import { CHAIN_ID, ONE_DAY_IN_MS } from '@/lib/constants'

import { INTRO_MODAL_REMIND_AFTER_DAYS, IntroModalStatus } from '../config'

const INTRO_MODAL_DISMISSALS_KEY = 'intro-modal-dismissals'

/** When the holder last closed the modal on each step, as a timestamp in ms. */
type Dismissals = Partial<Record<IntroModalStatus, number>>

const getStorageKey = (walletAddress: string) =>
  `${INTRO_MODAL_DISMISSALS_KEY}-${CHAIN_ID}-${walletAddress.toLowerCase()}`

const readDismissals = (key: string): Dismissals => {
  try {
    const stored = localStorage.getItem(key)
    const parsed = stored ? JSON.parse(stored) : null

    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    // Unreadable storage or a malformed entry: show the modal as if it was never closed
    return {}
  }
}

/**
 * Remembers, per wallet, that the holder closed the intro modal, so it does not reopen on every
 * reload or visit to Holdings.
 *
 * A dismissal only covers the step the holder closed. Reaching a different step (getting RBTC
 * after closing "add RBTC & RIF", for instance) shows the modal again, since it has something new
 * to say. Staying on the same step brings it back after INTRO_MODAL_REMIND_AFTER_DAYS.
 *
 * Each step keeps its own date, so closing a step shown by mistake (a balance read that failed
 * and came back as 0) does not erase the dismissal of the step the holder is really on.
 *
 * Storage is only read when `isDismissed` is called, which the modal does from an effect, so the
 * server render never touches localStorage.
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
      // A negative elapsed time means the clock moved back. Treat the dismissal as expired rather
      // than keeping the modal hidden until the clock catches up.
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
        // Ignore localStorage errors, the dismissal just will not survive a reload
      }
    },
    [key],
  )

  return { isDismissed, dismiss }
}
