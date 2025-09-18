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
const RootlingsS1 = {
  address: ROOTLINGS_S1_NFT_ADDRESS,
  abi: RootlingsS1ABI,
}

function useRootlingsS1() {
  const { address } = useAccount()
  const [enrichedData, setEnrichedData] = useState<{
    guards: Array<{ guard: Address }>
    minters: Array<{ minter: Address; rns?: string }>
    hasGuardRole: boolean
  } | null>(null)

  const {
    data,
    isFetching,
    isLoading,
    error: readError,
    refetch,
  } = useReadContracts({
    contracts: [
      { ...RootlingsS1, functionName: 'getWhitelistGuards' },
      { ...RootlingsS1, functionName: 'getMinters' },
      { ...RootlingsS1, functionName: 'hasRole', args: address ? [whitelistGuardRole, address] : undefined },
    ],
    query: {
      enabled: true,
      refetchInterval: 30_000, // refetch after 30 seconds
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      select(data) {
        const [guards, minters, hasGuardRole] = data
        return {
          guards: guards?.result?.map(guard => ({ guard })) ?? [],
          minters: (minters?.result ?? []).map(minter => ({ minter })),
          hasGuardRole: hasGuardRole.result ?? false,
        }
      },
    },
  })

  // Enrich data with RNS domains when data changes
  useEffect(() => {
    if (!data) return setEnrichedData(null)

    const enrichWithRns = async () => {
      const mintersWithRns = await Promise.all(
        data.minters.map(async ({ minter }) => ({
          minter,
          rns: await getEnsDomainName(minter),
        })),
      )
      setEnrichedData({
        ...data,
        minters: mintersWithRns,
      })
    }
    void enrichWithRns()
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
    }
  }, [readError, writeError])

  // Show success toast when transaction is confirmed and reload contract data
  useEffect(() => {
    if (isTxConfirmed && txHash) {
      toast.success(`Minter role revoked successfully! Tx: ${truncateMiddle(txHash)}`)
      refetch()
    }
  }, [isTxConfirmed, txHash, refetch])

  return useMemo(
    () => ({
      ...enrichedData,
      loading: isFetching || isLoading,
      revokeMinterRole,
      revokePending: isRevokePending || isTxPending,
    }),
    [enrichedData, isFetching, isLoading, revokeMinterRole, isRevokePending, isTxPending],
  )
}

export { useRootlingsS1 }
