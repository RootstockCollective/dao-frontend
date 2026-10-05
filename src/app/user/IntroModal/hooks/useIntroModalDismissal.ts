import { useCallback } from 'react'
import { useAccount } from 'wagmi'

import { CHAIN_ID, ONE_DAY_IN_MS } from '@/lib/constants'
import { getWalletStorageKey, safeStorage } from '@/lib/utils'

import { INTRO_MODAL_REMIND_AFTER_DAYS, IntroModalStatus } from '../config'

const INTRO_MODAL_DISMISSALS_KEY = `intro-modal-dismissals-${CHAIN_ID}`

/** Last close timestamp (ms) per step */
type Dismissals = Partial<Record<IntroModalStatus, number>>

const readDismissals = (key: string): Dismissals => {
  const stored = safeStorage.get(key)
  return stored && typeof stored === 'object' && !Array.isArray(stored) ? (stored as Dismissals) : {}
}

/**
 * Remembers, per wallet and step, when the holder closed the intro modal.
 * A closed step stays hidden for INTRO_MODAL_REMIND_AFTER_DAYS; other steps still show.
 *
 * Not built on use-local-storage-state: the key needs an address that can be undefined, and
 * storage is only read from the modal's effect.
 */
export const useIntroModalDismissal = () => {
  const { address } = useAccount()
  const key = address ? getWalletStorageKey(INTRO_MODAL_DISMISSALS_KEY, address) : null

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
      safeStorage.set(key, { ...readDismissals(key), [status]: Date.now() })
    },
    [key],
  )

  return { isDismissed, dismiss }
}
