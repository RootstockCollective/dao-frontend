import { getEnsDomainName } from '@/lib/rns'
import { useState, useEffect, useMemo } from 'react'
import { isAddress } from 'viem'
import { ParsedActionDetails } from '../types'

/**
 * Hook for resolving RNS domain names for addresses in proposal actions.
 * Resolves RNS asynchronously without blocking rendering.
 *
 * Pattern:
 * - Returns the base `parsedAction` immediately
 * - Only updates the `rns` field when resolution completes
 * - The returned object only changes when `parsedAction` reference changes OR `rns` changes
 * - Since `parsedAction` is memoized in parent, it has stable reference until dependencies change
 *
 * @param parsedAction - The parsed action details containing addresses (should be memoized in parent)
 * @returns Enhanced parsedAction with rns field populated when ready
 */
export function useProposalAddressResolution(parsedAction: ParsedActionDetails): ParsedActionDetails {
  const [rns, setRns] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Only resolve if we have a valid address
    const toAddress = parsedAction.toAddress
    if (!toAddress || !isAddress(toAddress, { strict: false })) {
      setRns(undefined)
      return
    }

    // Resolve RNS asynchronously
    const resolveRns = async () => {
      try {
        const resolvedRns = await getEnsDomainName(toAddress)
        if (resolvedRns) {
          setRns(resolvedRns)
        } else {
          setRns(undefined)
        }
      } catch (_error) {
        // Silently fail - RNS resolution is optional
        setRns(undefined)
      }
    }

    resolveRns()
  }, [parsedAction.toAddress])

  // Return object with base data + rns
  // Since parsedAction is memoized in parent, it has stable reference
  // Only creates new object when parsedAction changes (base data changed) OR rns changes
  return useMemo(
    () => ({
      ...parsedAction,
      rns,
    }),
    [parsedAction, rns],
  )
}
