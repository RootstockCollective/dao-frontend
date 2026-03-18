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

interface EnrichedAddresses {
  guards: AddressWithRNS[]
  minters: AddressWithRNS[]
}

const emptyEnrichedData: EnrichedAddresses = {
  guards: [],
  minters: [],
}

interface NftWhitelistConfig {
  address: Address
  abi: Abi
  toastIdPrefix: string
}

/**
 * Generic hook for managing NFT whitelist contracts that implement
 * the MINTER_ROLE / WHITELIST_GUARD_ROLE pattern (addToWhitelist, revokeRole, getMinters, etc.).
 */
export function useNftWhitelist({ address, abi, toastIdPrefix }: NftWhitelistConfig) {
  const [isQueryingRns, setIsQueryingRns] = useState(false)
  const { address: accountAddress } = useAccount()
  const [enrichedData, setEnrichedData] = useState<EnrichedAddresses>(emptyEnrichedData)

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

  useEffect(() => {
    if (!data) {
      setEnrichedData(emptyEnrichedData)
      return
    }

    let isStale = false

    /** Enrich both minters and guards with RNS domains.
     *  Guards enrichment is kept for parity with the original hook and future admin UI improvements. */
    const enrichWithRns = async () => {
      setIsQueryingRns(true)
      try {
        const [minters, guards] = await Promise.all(
          [data.minters, data.guards].map(addresses =>
            Promise.all(
              addresses.map(async ({ address }: AddressWithRNS) => ({
                address,
                rns: await getEnsDomainName(address),
              })),
            ),
          ),
        )

        if (!isStale) {
          setEnrichedData({ minters, guards })
        }
      } finally {
        if (!isStale) {
          setIsQueryingRns(false)
        }
      }
    }

    void enrichWithRns()

    return () => {
      isStale = true
      setIsQueryingRns(false)
    }
  }, [data])

  const { writeContract, isPending, error: writeError, data: txHash } = useWriteContract()
  const { isSuccess: isTxConfirmed, isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: Boolean(txHash),
    },
  })

  const { pending: globalPending, setPending } = useContractStore()

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

  useEffect(() => {
    if (isTxConfirmed && txHash) {
      toast.success(`Transaction successful! Hash: ${truncateMiddle(txHash, 5, 5)}`)
      reloadMinters()
    }
  }, [isTxConfirmed, txHash, reloadMinters])

  return useMemo(
    () => ({
      ...enrichedData,
      hasGuardRole: data?.hasGuardRole,
      loading: isFetching || isLoading || isQueryingRns,
      revokeMinterRole,
      whitelistMinters,
      pending: globalPending,
      reloadMinters,
    }),
    [
      enrichedData,
      isFetching,
      isLoading,
      isQueryingRns,
      revokeMinterRole,
      whitelistMinters,
      globalPending,
      reloadMinters,
      data?.hasGuardRole,
    ],
  )
}
