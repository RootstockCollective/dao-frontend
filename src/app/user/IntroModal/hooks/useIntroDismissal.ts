'use client'

import { useEffect, useSyncExternalStore } from 'react'
import { useAccount } from 'wagmi'

const INTRO_DISMISSAL_KEY = 'intro-onboarding-dismissed'

const getStorageKey = (walletAddress: string, chainId: number) =>
  `${INTRO_DISMISSAL_KEY}-${chainId}-${walletAddress.toLowerCase()}`

interface DismissalState {
  /**
   * The persisted opt-out. Null until the stored value has been read on the client — callers
   * must treat null as "not known yet", otherwise the modal flashes open on every load.
   */
  isDismissed: boolean | null
  /** Closed with Escape or the X. Memory only, so the onboarding returns on the next load. */
  isClosedForSession: boolean
}

const UNKNOWN: DismissalState = { isDismissed: null, isClosedForSession: false }

/**
 * One store for the whole app rather than per-hook `useState`.
 *
 * The modal and the re-entry link live in different subtrees of `/user`, and localStorage
 * fires no event in the tab that wrote it. With independent state, dismissing in the modal
 * left the link's copy stale and clicking the link cleared storage without reopening
 * anything — the affordance was invisible, then inert.
 */
let activeKey: string | null = null
let state: DismissalState = UNKNOWN
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const getSnapshot = () => state
// The server knows nothing about storage, so it must render the "not known yet" state.
const getServerSnapshot = () => UNKNOWN

const setState = (next: DismissalState) => {
  state = next
  listeners.forEach(listener => listener())
}

const readStored = (key: string): boolean => {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    // A browser that refuses storage just gets the onboarding every time.
    return false
  }
}

const dismiss = () => {
  // Set state whether or not the write lands, so the modal always closes on click.
  setState({ isDismissed: true, isClosedForSession: false })

  if (!activeKey) {
    return
  }

  try {
    localStorage.setItem(activeKey, 'true')
  } catch {
    // Ignore storage errors — the dismissal just will not survive a reload.
  }
}

/**
 * Closes the onboarding without opting the user out of it. Escape and the X mean "close this
 * thing", not "never show me this again" — only the explicit skip button promises "for now".
 */
const closeForSession = () => setState({ ...state, isClosedForSession: true })

const restore = () => {
  setState({ isDismissed: false, isClosedForSession: false })

  if (!activeKey) {
    return
  }

  try {
    localStorage.removeItem(activeKey)
  } catch {
    // Ignore storage errors.
  }
}

/** Resets the module-level store. Tests only — nothing in the app should need this. */
export const resetIntroDismissalStore = () => {
  activeKey = null
  state = UNKNOWN
}

interface UseIntroDismissalReturn {
  /** The persisted opt-out. Null until storage has been read. */
  isDismissed: boolean | null
  /**
   * Whether the onboarding should stay closed for any reason — persisted or session-only.
   * Null until storage has been read. This is what gates rendering the modal.
   */
  isHidden: boolean | null
  /** Remembers that the user opted out of the onboarding. Survives reloads. */
  dismiss: () => void
  /** Closes the onboarding for this page view only. */
  closeForSession: () => void
  /** Reopens the onboarding, clearing both the persisted and the session close. */
  restore: () => void
}

/**
 * Whether the staking onboarding should be showing, tracked per wallet and per chain.
 *
 * The stored value is read in an effect rather than during render: localStorage does not
 * exist on the server, and reading it while rendering makes the first client paint disagree
 * with the server one.
 *
 * Every storage call is wrapped: a browser that refuses localStorage should quietly show the
 * onboarding again, never break.
 */
export const useIntroDismissal = (): UseIntroDismissalReturn => {
  const { address, chainId } = useAccount()
  const key = address && chainId ? getStorageKey(address, chainId) : null

  // Re-reading the same key is a no-op, so every hook instance can run this without fighting
  // the others. A wallet or chain switch re-reads and drops any session close with it.
  useEffect(() => {
    if (key === activeKey) {
      return
    }

    activeKey = key
    setState(key ? { isDismissed: readStored(key), isClosedForSession: false } : UNKNOWN)
  }, [key])

  const { isDismissed, isClosedForSession } = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  return {
    isDismissed,
    isHidden: isDismissed === null ? null : isDismissed || isClosedForSession,
    dismiss,
    closeForSession,
    restore,
  }
}
