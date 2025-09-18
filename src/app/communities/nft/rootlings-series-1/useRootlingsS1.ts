'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { type Address, keccak256, stringToBytes } from 'viem'
import { useAccount, useReadContracts, useWaitForTransactionReceipt, useWriteContract } from 'wagmi'

import { RootlingsS1ABI } from '@/lib/abis/RootlingsS1'
import { ROOTLINGS_S1_NFT_ADDRESS } from '@/lib/constants'
import { getEnsDomainName } from '@/lib/rns'
import { truncateMiddle } from '@/lib/utils'

const minterRole = keccak256(stringToBytes('MINTER_ROLE'))
const whitelistGuardRole = keccak256(stringToBytes('WHITELIST_GUARD_ROLE'))
/** Rootlings Series 1 smart contract */
const RootlingsS1 = {
  address: ROOTLINGS_S1_NFT_ADDRESS,
  abi: RootlingsS1ABI,
}
interface AddressWithRNS {
  address: Address
  rns?: string
}
interface EnrichedAddresses {
  guards: AddressWithRNS[]
  minters: AddressWithRNS[]
}
/** Default data for addresses enriched with known RNS domains */
const emptyEnrichedData: EnrichedAddresses = {
  guards: [],
  minters: [],
}
/**
 * Custom React hook for interacting with the Rootlings Series 1 NFT contract.
 * Fetches minters, guards, and role info, and enriches minter data with RNS domains.
 */
function useRootlingsS1() {
  const { address } = useAccount()
  const [enrichedData, setEnrichedData] = useState<EnrichedAddresses>(emptyEnrichedData)

  const {
    data,
    isFetching,
    isLoading,
    error: readError,
    refetch: reloadMinters,
  } = useReadContracts({
    contracts: [
      { ...RootlingsS1, functionName: 'getWhitelistGuards' },
      { ...RootlingsS1, functionName: 'getMinters' },
      { ...RootlingsS1, functionName: 'hasRole', args: address ? [whitelistGuardRole, address] : undefined },
    ],
    query: {
      enabled: true,
      refetchInterval: 30_000, // refetch after 30 seconds
      staleTime: 30_000,
      retry: 1,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select(data) {
        const [guards, minters, hasGuardRole] = data
        return {
          guards: guards?.result?.map(address => ({ address })) ?? [],
          minters: (minters?.result ?? []).map(address => ({ address })),
          hasGuardRole: hasGuardRole.result ?? false,
        }
      },
    },
  })

  // Enrich data with RNS domains when data changes
  useEffect(() => {
    if (!data) {
      setEnrichedData(emptyEnrichedData)
      return
    }

    let isStale = false // Race condition protection: ignore old promise if effect restarts

    const enrichWithRns = async () => {
      // Double map: enrich both minters and guards in a single Promise.all, single pass
      const [minters, guards] = await Promise.all(
        [data.minters, data.guards].map(addresses =>
          Promise.all(
            addresses.map(async ({ address }) => ({
              address,
              rns: await getEnsDomainName(address),
            })),
          ),
        ),
      )

      // Check if this result is still relevant
      if (!isStale) {
        setEnrichedData({
          minters,
          guards,
        })
      }
    }

    void enrichWithRns()

    // Cleanup: mark result as stale when effect restarts
    return () => {
      isStale = true
    }
  }, [data])

  const { writeContract, isPending: isRevokePending, error: writeError, data: txHash } = useWriteContract()
  const { isSuccess: isTxConfirmed, isLoading: isTxPending } = useWaitForTransactionReceipt({
    hash: txHash,
    query: {
      enabled: Boolean(txHash),
    },
  })

  const revokeMinterRole = useCallback(
    (minter: Address) => {
      if (!data?.hasGuardRole) return toast.error('You have to be a whitelist guard.')

      writeContract({
        ...RootlingsS1,
        functionName: 'revokeRole',
        args: [minterRole, minter],
      })
    },
    [data?.hasGuardRole, writeContract],
  )

  useEffect(() => {
    if (readError) {
      // Show error only if it's not already displayed
      toast.error(readError.message, {
        toastId: 'rootlings-read-error', // use toastId instead of id
        autoClose: false, // do not auto-dismiss
      })
    } else {
      // No error = dismiss toast
      toast.dismiss('rootlings-read-error')
    }
    if (writeError) {
      if (writeError.message.includes('User rejected the request')) return
      toast.error(writeError.message, {
        toastId: 'rootlings-write-error',
      })
    } else {
      // Dismiss toast when write error is cleared
      toast.dismiss('rootlings-write-error')
    }
  }, [readError, writeError])

  // Show success toast when transaction is confirmed and reload contract data
  useEffect(() => {
    if (isTxConfirmed && txHash) {
      toast.success(`Minter role revoked successfully! Tx: ${truncateMiddle(txHash)}`)
      reloadMinters()
    }
  }, [isTxConfirmed, txHash, reloadMinters])

  return useMemo(
    () => ({
      ...enrichedData,
      hasGuardRole: data?.hasGuardRole,
      loading: isFetching || isLoading,
      revokeMinterRole,
      revokePending: isRevokePending || isTxPending,
      reloadMinters,
    }),
    [
      enrichedData,
      isFetching,
      isLoading,
      revokeMinterRole,
      isRevokePending,
      isTxPending,
      reloadMinters,
      data?.hasGuardRole,
    ],
  )
}

export { useRootlingsS1 }
