import { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const INTRO_DISMISSAL_KEY = 'intro-onboarding-dismissed'

const getStorageKey = (walletAddress: string, chainId: number) =>
  `${INTRO_DISMISSAL_KEY}-${chainId}-${walletAddress.toLowerCase()}`

interface UseIntroDismissalReturn {
  /**
   * Null until the stored value has been read on the client. Callers must treat null as
   * "not known yet" and hold off opening the modal, otherwise it flashes open on every load.
   */
  isDismissed: boolean | null
  /** Remembers that the user skipped the onboarding. */
  dismiss: () => void
  /** Clears the flag, so the onboarding can be reopened from the re-entry point. */
  restore: () => void
}

/**
 * Remembers that the user skipped the staking onboarding, per wallet and per chain.
 *
 * The value is read in an effect rather than during render: localStorage does not exist on
 * the server, and reading it while rendering makes the first client paint disagree with the
 * server one.
 *
 * Every storage call is wrapped: a browser that refuses localStorage should quietly show the
 * onboarding again, never break.
 */
export const useIntroDismissal = (): UseIntroDismissalReturn => {
  const { address, chainId } = useAccount()
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!address || !chainId) {
      setIsDismissed(null)
      return
    }

    try {
      setIsDismissed(localStorage.getItem(getStorageKey(address, chainId)) === 'true')
    } catch {
      // A browser that refuses storage just gets the onboarding every time.
      setIsDismissed(false)
    }
  }, [address, chainId])

  const dismiss = useCallback(() => {
    // Set state whether or not the write lands, so the modal always closes on click.
    setIsDismissed(true)

    if (!address || !chainId) {
      return
    }

    try {
      localStorage.setItem(getStorageKey(address, chainId), 'true')
    } catch {
      // Ignore storage errors — the dismissal just will not survive a reload.
    }
  }, [address, chainId])

  const restore = useCallback(() => {
    setIsDismissed(false)

    if (!address || !chainId) {
      return
    }

    try {
      localStorage.removeItem(getStorageKey(address, chainId))
    } catch {
      // Ignore storage errors.
    }
  }, [address, chainId])

  return { isDismissed, dismiss, restore }
}
