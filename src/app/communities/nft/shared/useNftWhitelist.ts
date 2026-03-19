'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { type Abi, type Address, keccak256, stringToBytes } from 'viem'
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'
import { create } from 'zustand'

import { getEnsDomainName } from '@/lib/rns'
import { truncateMiddle } from '@/lib/utils'

const useContractStore = create<{
  pending: boolean
  setPending: (pending: boolean) => void
}>(set => ({
  pending: false,
  setPending: pending => set({ pending }),
}))

const minterRole = keccak256(stringToBytes('MINTER_ROLE'))
const whitelistGuardRole = keccak256(stringToBytes('WHITELIST_GUARD_ROLE'))

export interface AddressWithRNS {
  address: Address
  rns?: string
}

interface RawAddresses {
  guards: AddressWithRNS[]
  minters: AddressWithRNS[]
}

/**
 * Hook to enrich raw addresses (without RNS) with RNS domain names.
 * Returns enriched addresses and loading state.
 * This is a separate async derivation independent of server state.
 */
function useEnrichedAddresses(rawAddresses: RawAddresses | null) {
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichedAddresses, setEnrichedAddresses] = useState<RawAddresses>({
    guards: [],
    minters: [],
  })

  useEffect(() => {
    if (!rawAddresses) {
      setEnrichedAddresses({ guards: [], minters: [] })
      return
    }

    let isStale = false

    const enrichWithRns = async () => {
      setIsEnriching(true)
      try {
        const [minters, guards] = await Promise.all(
          [rawAddresses.minters, rawAddresses.guards].map(addresses =>
            Promise.all(
              addresses.map(async ({ address }: AddressWithRNS) => ({
                address,
                rns: await getEnsDomainName(address),
              })),
            ),
          ),
        )

        if (!isStale) {
          setEnrichedAddresses({ minters, guards })
        }
      } finally {
        if (!isStale) {
          setIsEnriching(false)
        }
      }
    }

    void enrichWithRns()

    return () => {
      isStale = true
      setIsEnriching(false)
    }
  }, [rawAddresses])

  return { enrichedAddresses, isEnriching }
}

interface NftWhitelistConfig {
  address: Address
  abi: Abi
  toastIdPrefix: string
}

/**
 * Generic hook for managing NFT whitelist contracts that implement
 * the MINTER_ROLE / WHITELIST_GUARD_ROLE pattern (addToWhitelist, revokeRole, getMinters, etc.).
 * Fetches contract state and enriches addresses with RNS domains.
 */
export function useNftWhitelist({ address, abi, toastIdPrefix }: NftWhitelistConfig) {
  const { address: accountAddress } = useAccount()

  const contract = useMemo(() => ({ address, abi }), [address, abi])

  const {
    data,
    isFetching,
    isLoading,
    error: readError,
    refetch: reloadMinters,
  } = useReadContracts({
    contracts: [
      { ...contract, functionName: 'getWhitelistGuards' },
      { ...contract, functionName: 'getMinters' },
      {
        ...contract,
        functionName: 'hasRole',
        args: accountAddress ? [whitelistGuardRole, accountAddress] : undefined,
      },
    ],
    query: {
      refetchInterval: 30_000,
      refetchOnWindowFocus: false,
      select(data) {
        const [guards, minters, hasGuardRole] = data
        // SAFETY: wagmi useReadContracts returns untyped results when using a generic Abi;
        // these casts match the contract return types (address[] for guards/minters, bool for hasRole).
        return {
          guards: ((guards?.result as Address[] | undefined) ?? []).map(addr => ({ address: addr })),
          minters: ((minters?.result as Address[] | undefined) ?? []).map(addr => ({ address: addr })),
          hasGuardRole: (hasGuardRole?.result as boolean) ?? false,
        }
      },
    },
  })

  const rawAddresses = useMemo(() => (data ? { minters: data.minters, guards: data.guards } : null), [data])

  const { enrichedAddresses, isEnriching } = useEnrichedAddresses(rawAddresses)

  const { writeContract, isPending, error: writeError, data: txHash } = useWriteContract()
  const { isSuccess: isTxConfirmed, isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: Boolean(txHash),
    },
  })

  const { pending: globalPending, setPending } = useContractStore()

  // React to write pending state: keep global overlay in sync so any whitelist write shows spinner.
  useEffect(() => {
    setPending(isPending || isTxPending)
  }, [isPending, isTxPending, setPending])

  const revokeMinterRole = useCallback(
    (minter: Address) => {
      if (!data?.hasGuardRole) return toast.error('You need guard permissions')

      writeContract({
        ...contract,
        functionName: 'revokeRole',
        args: [minterRole, minter],
      })
    },
    [contract, data?.hasGuardRole, writeContract],
  )

  const whitelistMinters = useCallback(
    (minters: Address[]) => {
      if (!data?.hasGuardRole) return toast.error('You need guard permissions')

      writeContract({
        ...contract,
        functionName: 'addToWhitelist',
        args: [minters],
      })
    },
    [contract, data?.hasGuardRole, writeContract],
  )

  // React to read/write errors: show or dismiss toasts by toastId.
  useEffect(() => {
    if (readError) {
      toast.error(readError.message, {
        toastId: `${toastIdPrefix}-read-error`,
        autoClose: false,
      })
    } else {
      toast.dismiss(`${toastIdPrefix}-read-error`)
    }
    if (writeError) {
      if (writeError.message.includes('User rejected the request')) return
      toast.error(writeError.message, {
        toastId: `${toastIdPrefix}-write-error`,
      })
    } else {
      toast.dismiss(`${toastIdPrefix}-write-error`)
    }
  }, [readError, writeError, toastIdPrefix])

  // React to tx confirmation: show success toast and refetch minters.
  useEffect(() => {
    if (isTxConfirmed && txHash) {
      toast.success(`Transaction successful! Hash: ${truncateMiddle(txHash, 5, 5)}`)
      reloadMinters()
    }
  }, [isTxConfirmed, txHash, reloadMinters])

  return useMemo(
    () => ({
      ...enrichedAddresses,
      hasGuardRole: data?.hasGuardRole,
      loading: isFetching || isLoading || isEnriching,
      revokeMinterRole,
      whitelistMinters,
      pending: globalPending,
      reloadMinters,
    }),
    [
      enrichedAddresses,
      isFetching,
      isLoading,
      isEnriching,
      revokeMinterRole,
      whitelistMinters,
      globalPending,
      reloadMinters,
      data?.hasGuardRole,
    ],
  )
}
