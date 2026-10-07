'use client'
import posthog from 'posthog-js'
import { useCallback, useId, useRef, useState } from 'react'
import { Address } from 'viem'
import { useAccount } from 'wagmi'

import { DelegateModal } from '@/app/delegate/components/DelegateModal'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { keepsOwnVotes } from '@/app/delegate/lib/delegationStatus'
import { DelegatesContainer } from '@/app/delegate/sections/DelegateContentSection/DelegatesContainer'
import { DelegationDetailsSection } from '@/app/delegate/sections/DelegateContentSection/DelegationDetailsSection'
import { NotDelegatedSection } from '@/app/delegate/sections/DelegateContentSection/NotDelegatedSection'
import { NoVotingPowerSection } from '@/app/delegate/sections/DelegateContentSection/NoVotingPowerSection'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'
import { formatSymbol } from '@/app/shared/formatter'
import { isUserRejectedTxError, txFailureProps } from '@/components/ErrorPage/commonErrors'
import { STRIF } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { executeTxFlow } from '@/shared/notification/executeTxFlow'

import { DelegateeState } from '../../lib/types'

export const ConnectedSection = () => {
  const {
    delegationStatus,
    ownStRif,
    availableVotes,
    isAccountRead,
    isDelegationPending,
    isReclaimPending,
    displayedDelegatee,
    nextDelegatee,
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
  const delegatesListId = useId()

  const handleDelegate = useCallback(
    (address: Address) => {
      setIsRequestingDelegate(true)
      executeTxFlow({
        onRequestTx: () => onDelegate(address),
        onPending: () => {
          setIsDelegationPending(true)
          setIsDelegateModalOpened(false)
        },
        // Awaited so the button can't be pressed again before the new delegate is read
        onSuccess: async () => {
          await refetch()
          onHideDelegates()
        },
        onError: (txHash, err) => {
          if (isUserRejectedTxError(err)) return
          posthog.capture('voting_power_delegate_failed', {
            delegatee_address: address.toLowerCase(),
            ...txFailureProps(err),
            tx_hash: txHash,
          })
        },
        onComplete: () => {
          setIsDelegationPending(false)
          setIsRequestingDelegate(false)
          setIsDelegateModalOpened(false)
          setNextDelegatee(undefined)
        },
        action: 'delegation',
      })
    },
    [onDelegate, setIsDelegationPending, setIsDelegateModalOpened, refetch, setNextDelegatee],
  )

  const handleReclaim = useCallback(() => {
    setIsRequestingReclaim(true)
    executeTxFlow({
      onRequestTx: () => onDelegate(ownAddress as Address),
      onPending: () => {
        setIsReclaimPending(true)
        setIsReclaimModalOpened(false)
      },
      onSuccess: refetch,
      onError: (txHash, err) => {
        if (isUserRejectedTxError(err)) return
        posthog.capture('voting_power_reclaim_failed', {
          previous_delegatee_address: displayedDelegatee?.address?.toLowerCase(),
          ...txFailureProps(err),
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

  const hasStRif = ownStRif > 0n
  const votingPower = formatSymbol(ownStRif, STRIF)

  const isPendingTx = isDelegationPending || isReclaimPending

  // Prevent double clicking by disabling action button while opening metamask
  const isPendingDelegate = isDelegationPending || isRequestingDelegate
  const isPendingReclaim = isReclaimPending || isRequestingReclaim

  const isOwnVotingPower = keepsOwnVotes(delegationStatus)
  const isDelegatesListOpen = delegationStatus === 'self' && hasStRif
  const isDelegatesListShown = shouldShowDelegates || isDelegatesListOpen

  return (
    <>
      <DelegationDetailsSection onShowReclaim={onShowReclaim} onShowDelegates={onShowDelegates} />
      {isAccountRead && isOwnVotingPower && !hasStRif && availableVotes === 0n && <NoVotingPowerSection />}
      {isAccountRead && delegationStatus === 'none' && hasStRif && !displayedDelegatee && (
        <NotDelegatedSection
          isDelegatingToSelf={isPendingDelegate && !nextDelegatee}
          onDelegateToSelf={() => handleDelegate(ownAddress as Address)}
          isChoosingDelegate={shouldShowDelegates}
          delegatesListId={delegatesListId}
          onToggleDelegates={shouldShowDelegates ? onHideDelegates : onShowDelegates}
        />
      )}
      {!isPendingTx && (
        <div
          ref={delegatesContainerRef}
          id={delegatesListId}
          className={cn(
            'transition-all duration-300 overflow-hidden',
            isDelegatesListShown ? 'max-h-[100%] opacity-100' : 'max-h-0 opacity-0',
          )}
          inert={!isDelegatesListShown}
          data-testid="DelegatesContainer"
        >
          <DelegatesContainer
            hasOtherDelegatee={delegationStatus === 'other'}
            isClosable={!isDelegatesListOpen}
            onDelegate={onNextDelegate}
            onCloseClick={onHideDelegates}
          />
        </div>
      )}
      {isDelegateModalOpened && nextDelegatee && (
        <DelegateModal
          onDelegate={handleDelegate}
          onClose={onCloseDelegateModal}
          isLoading={isPendingDelegate}
          title={
            hasStRif
              ? `You are about to delegate your own voting power of ${votingPower} to`
              : // The delegate is kept when staking, so it can be chosen before having stRIF
                'You have no stRIF yet. The stRIF you stake will be delegated to'
          }
          address={nextDelegatee.address}
          name={nextDelegatee.rns}
          imageIpfs={nextDelegatee.imageIpfs}
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
