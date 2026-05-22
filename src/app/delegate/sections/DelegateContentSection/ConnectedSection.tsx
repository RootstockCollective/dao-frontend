'use client'
import posthog from 'posthog-js'
import { useCallback, useRef, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

import { DelegateModal } from '@/app/delegate/components/DelegateModal'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { DelegatesContainer } from '@/app/delegate/sections/DelegateContentSection/DelegatesContainer'
import { DelegationDetailsSection } from '@/app/delegate/sections/DelegateContentSection/DelegationDetailsSection'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { executeTxFlow } from '@/shared/notification/executeTxFlow'

import { DelegateeState } from '../../lib/types'

export const ConnectedSection = () => {
  const {
    didIDelegateToMyself,
    cards,
    isDelegationPending,
    isReclaimPending,
    displayedDelegatee,
    setIsDelegationPending,
    setIsReclaimPending,
    setNextDelegatee,
    refetch,
  } = useDelegateContext()

  const { address: ownAddress } = useAccount()
  const { onDelegate } = useDelegateToAddress()

  const [shouldShowDelegates, setShouldShowDelegates] = useState(false)
  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [isReclaimModalOpened, setIsReclaimModalOpened] = useState(false)

  const [isRequestingDelegate, setIsRequestingDelegate] = useState(false) // opening metamask
  const [isRequestingReclaim, setIsRequestingReclaim] = useState(false) // opening metamask
  const delegatesContainerRef = useRef<HTMLDivElement>(null)

  const handleDelegate = useCallback(
    (address: Address) => {
      setIsRequestingDelegate(true)
      const baseProps = {
        delegatee_address: address,
        delegatee_rns: displayedDelegatee?.rns ?? '',
        voting_power_str: cards.own.contentValue,
        voting_power_decimal: Number(cards.own.contentValue) || 0,
        is_self_delegation: address.toLowerCase() === ownAddress?.toLowerCase(),
      }
      posthog.capture('voting_power_delegated', baseProps)
      executeTxFlow({
        onRequestTx: () => onDelegate(address),
        onPending: () => {
          setIsDelegationPending(true)
          setIsDelegateModalOpened(false)
        },
        onSuccess: txHash => {
          posthog.capture('voting_power_delegate_confirmed', { ...baseProps, tx_hash: txHash })
          refetch()
          onHideDelegates()
        },
        onError: (txHash, err) => {
          posthog.capture('voting_power_delegate_failed', {
            ...baseProps,
            failure_reason: err.name === 'Rejected TX' ? 'user_rejected' : 'tx_failed',
            error_message: err.message,
            tx_hash: txHash,
          })
        },
        onComplete: () => {
          setIsDelegationPending(false)
          setIsRequestingDelegate(false)
          setNextDelegatee(undefined)
        },
        action: 'delegation',
      })
    },
    [
      onDelegate,
      setIsDelegationPending,
      setIsDelegateModalOpened,
      refetch,
      setNextDelegatee,
      displayedDelegatee?.rns,
      cards.own.contentValue,
      ownAddress,
    ],
  )

  const handleReclaim = useCallback(() => {
    setIsRequestingReclaim(true)
    const baseProps = {
      delegatee_address: ownAddress,
      previous_delegatee_address: displayedDelegatee?.address,
      previous_delegatee_rns: displayedDelegatee?.rns ?? '',
      voting_power_str: cards.own.contentValue,
      voting_power_decimal: Number(cards.own.contentValue) || 0,
    }
    posthog.capture('voting_power_reclaimed', baseProps)
    executeTxFlow({
      onRequestTx: () => onDelegate(ownAddress as Address),
      onPending: () => {
        setIsReclaimPending(true)
        setIsReclaimModalOpened(false)
      },
      onSuccess: txHash => {
        posthog.capture('voting_power_reclaim_confirmed', { ...baseProps, tx_hash: txHash })
        refetch()
      },
      onError: (txHash, err) => {
        posthog.capture('voting_power_reclaim_failed', {
          ...baseProps,
          failure_reason: err.name === 'Rejected TX' ? 'user_rejected' : 'tx_failed',
          error_message: err.message,
          tx_hash: txHash,
        })
      },
      onComplete: () => {
        setIsReclaimPending(false)
        setIsRequestingReclaim(false)
        setNextDelegatee(undefined)
      },
      action: 'reclaiming',
    })
  }, [
    onDelegate,
    ownAddress,
    setIsReclaimPending,
    setIsReclaimModalOpened,
    refetch,
    setNextDelegatee,
    displayedDelegatee?.address,
    displayedDelegatee?.rns,
    cards.own.contentValue,
  ])

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
    setTimeout(() => {
      delegatesContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 1)
  }

  const onHideDelegates = () => {
    setShouldShowDelegates(false)
  }

  const onNextDelegate = (address: Address, rns = '', imageIpfs?: string | null) => {
    setIsDelegateModalOpened(true)
    setNextDelegatee({ address, rns, imageIpfs } as DelegateeState)
  }

  const onCloseDelegateModal = () => {
    setIsDelegateModalOpened(false)
    setNextDelegatee(undefined)
  }

  const onShowReclaim = () => {
    setIsReclaimModalOpened(true)
  }

  const votingPower = formatNumberWithCommas(Number(cards.own.contentValue))

  const isPendingTx = isDelegationPending || isReclaimPending

  // Prevent double clicking by disabling action button while opening metamask
  const isPendingDelegate = isDelegationPending || isRequestingDelegate
  const isPendingReclaim = isReclaimPending || isRequestingReclaim

  return (
    <>
      <DelegationDetailsSection onShowReclaim={onShowReclaim} onShowDelegates={onShowDelegates} />
      {!isPendingTx && (
        <div
          ref={delegatesContainerRef}
          className={cn(
            'transition-all duration-300 overflow-hidden',
            shouldShowDelegates || didIDelegateToMyself ? 'max-h-[100%] opacity-100' : 'max-h-0 opacity-0',
          )}
          data-testid="DelegatesContainer"
        >
          <DelegatesContainer
            didIDelegateToMyself={didIDelegateToMyself}
            onDelegate={onNextDelegate}
            onCloseClick={onHideDelegates}
          />
        </div>
      )}
      {isDelegateModalOpened && displayedDelegatee && (
        <DelegateModal
          onDelegate={handleDelegate}
          onClose={onCloseDelegateModal}
          isLoading={isPendingDelegate}
          title={`You are about to delegate your own voting power of ${votingPower} to`}
          address={displayedDelegatee.address}
          name={displayedDelegatee.rns}
          imageIpfs={displayedDelegatee.imageIpfs}
          actionButtonText={isPendingDelegate ? 'Delegating...' : 'Delegate'}
          data-testid="delegateModal"
        />
      )}
      {isReclaimModalOpened && displayedDelegatee && (
        <DelegateModal
          onDelegate={handleReclaim}
          onClose={() => setIsReclaimModalOpened(false)}
          isLoading={isPendingReclaim}
          title={`You are about to reclaim your own voting power of ${votingPower} from`}
          name={displayedDelegatee.rns}
          address={displayedDelegatee.address}
          since={formatTimestampToMonthYear(displayedDelegatee.delegatedSince) || ''}
          imageIpfs={displayedDelegatee.imageIpfs}
          actionButtonText={isPendingReclaim ? 'Reclaiming...' : 'Reclaim'}
          data-testid="reclaimModal"
        />
      )}
    </>
  )
}
