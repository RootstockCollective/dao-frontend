'use client'
import { initialContextState, initialDataState, initialUIState } from '@/app/delegate/lib/constants'
import { DelegateContextState, DelegateDataState, DelegateUIState } from '@/app/delegate/lib/types'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { useNftHoldersWithVotingPower } from '@/app/user/Delegation/hooks/useNftHoldersWithVotingPower'
import { produce } from 'immer'
import { createContext, ReactNode, useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { formatEther } from 'viem'
import { useAccount, useReadContract } from 'wagmi'
import { StRIFTokenAbi } from '@/lib/abis/StRIFTokenAbi'
import { tokenContracts } from '@/lib/contracts'
import Big from '@/lib/big'

// Context
const DelegateContext = createContext<DelegateContextState>(initialContextState)

// Custom hook to use the context
export const useDelegateContext = (): DelegateContextState => {
  const context = useContext(DelegateContext)
  if (context === undefined) {
    throw new Error('useDelegateContext must be used within a DelegateContextProvider')
  }
  return context
}

interface Props {
  children: ReactNode
}

export const DelegateContextProvider = ({ children }: Props) => {
  const { address } = useAccount()

  // State management with useState and Immer
  const [dataState, setDataState] = useState<DelegateDataState>(initialDataState)
  const [uiState, setUIState] = useState<DelegateUIState>(initialUIState)

  // Fetch delegation data
  const {
    amount: received,
    delegated,
    own,
    available,
    didIDelegateToMyself,
    delegateeAddress,
    isLoading,
    delegateeVotingPower,
    delegateeRns,
    refetch,
  } = useGetExternalDelegatedAmount(address)

  // Fetch all delegates to get image data for current delegatee
  const allDelegates = useNftHoldersWithVotingPower()

  const { data: totalSupply } = useReadContract({
    abi: StRIFTokenAbi,
    address: tokenContracts.stRIF,
    functionName: 'totalSupply',
  })
  // Find current delegatee's data efficiently in a single useMemo
  const delegateeData = useMemo(() => {
    if (!delegateeAddress)
      return {
        imageIpfs: undefined,
        delegatedSince: undefined,
        totalVotes: undefined,
        delegators: undefined,
        votingWeight: undefined,
      }

    const delegatee = allDelegates.find(
      delegate => delegate.address.toLowerCase() === delegateeAddress.toLowerCase(),
    )

    // Calculate voting weight as percentage of total supply
    let votingWeight: string | undefined = undefined
    if (delegateeVotingPower && totalSupply) {
      const votingPowerNumber = Big(formatEther(delegateeVotingPower))
      const totalSupplyNumber = Big(formatEther(totalSupply))
      votingWeight = votingPowerNumber.div(totalSupplyNumber).times(100).toFixed(2) + '%'
    }

    return {
      imageIpfs: delegatee?.imageIpfs || undefined,
      delegatedSince: delegatee?.delegatedSince || undefined,
      totalVotes: delegatee?.totalVotes || undefined,
      delegators: delegatee?.delegators || undefined,
      votingWeight,
    }
  }, [delegateeAddress, allDelegates, delegateeVotingPower, totalSupply])

  // Destructure for easier access
  const {
    imageIpfs: delegateeImageIpfs,
    delegatedSince: delegateeDelegatedSince,
    totalVotes: delegateeTotalVotes,
    delegators: delegateeDelegators,
    votingWeight: delegateeVotingWeight,
  } = delegateeData

  // Actions
  const setIsDelegationPending = useCallback((isPending: boolean) => {
    setUIState(
      produce(draft => {
        draft.isDelegationPending = isPending
      }),
    )
  }, [])

  const setIsReclaimPending = useCallback((isPending: boolean) => {
    setUIState(
      produce(draft => {
        draft.isReclaimPending = isPending
      }),
    )
  }, [])

  // Update data when delegation data changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.received.contentValue = Number(formatEther(received)).toFixed(0)
        draft.cards.own.contentValue = Number(formatEther(own)).toFixed(0)
        draft.cards.delegated.contentValue = Number(formatEther(delegated)).toFixed(0)
        draft.cards.available.contentValue = Number(formatEther(available)).toFixed(0)
        draft.didIDelegateToMyself = didIDelegateToMyself
        draft.delegateeAddress = delegateeAddress
        draft.delegateeRns = delegateeRns
        draft.delegateeVotingPower = delegateeVotingPower ? formatEther(delegateeVotingPower) : undefined
        draft.delegateeImageIpfs = delegateeImageIpfs
        draft.delegateeDelegatedSince = delegateeDelegatedSince
        draft.delegateeTotalVotes = delegateeTotalVotes
        draft.delegateeDelegators = delegateeDelegators
        draft.delegateeVotingWeight = delegateeVotingWeight
      }),
    )
  }, [
    received,
    delegated,
    own,
    available,
    didIDelegateToMyself,
    delegateeAddress,
    delegateeVotingPower,
    delegateeRns,
    delegateeImageIpfs,
    delegateeDelegatedSince,
    delegateeTotalVotes,
    delegateeDelegators,
    delegateeVotingWeight,
  ])

  // Update loading state when UI state changes
  useEffect(() => {
    setDataState(
      produce(draft => {
        // loading states
        draft.cards.delegated.isLoading = uiState.isDelegationPending || uiState.isReclaimPending
        draft.cards.available.isLoading = uiState.isDelegationPending || uiState.isReclaimPending

        const ownValue = Number(formatEther(own))
        const delegatedValue = Number(formatEther(delegated))
        const availableValue = Number(formatEther(available))

        // content values
        if (uiState.isDelegationPending) {
          draft.cards.delegated.contentValue = ownValue.toFixed(0)
          draft.cards.available.contentValue = (availableValue - ownValue).toFixed(0)
        } else if (uiState.isReclaimPending) {
          draft.cards.delegated.contentValue = '0'
          draft.cards.available.contentValue = (availableValue + delegatedValue).toFixed(0)
        } else {
          draft.cards.delegated.contentValue = delegatedValue.toFixed(0)
          draft.cards.available.contentValue = availableValue.toFixed(0)
        }
      }),
    )
  }, [uiState.isDelegationPending, uiState.isReclaimPending, received, delegated, own, available])

  // Update loading state when refetching
  useEffect(() => {
    setDataState(
      produce(draft => {
        draft.cards.available.isLoading = isLoading
        draft.cards.own.isLoading = isLoading
        draft.cards.received.isLoading = isLoading
        draft.cards.delegated.isLoading = isLoading
      }),
    )
  }, [isLoading])

  // Combine state and actions
  const contextValue: DelegateContextState = {
    ...dataState,
    ...uiState,
    setIsDelegationPending,
    setIsReclaimPending,
    refetch,
  }

  return <DelegateContext.Provider value={contextValue}>{children}</DelegateContext.Provider>
}
