'use client'
import { DelegatesContainer } from '@/app/delegate/sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { DelegationDetailsSection } from '@/app/delegate/sections/DelegateContentSection/DelegationDetailsSection'
import { Address } from 'viem'
import { useCallback, useMemo, useRef, useState } from 'react'
import { DelegateModal } from '@/app/delegate/components/DelegateModal'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { executeTxFlow } from '@/shared/notification/executeTxFlow'
import { useAccount } from 'wagmi'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'
import { cn, formatNumberWithCommas } from '@/lib/utils'

export const ConnectedSection = () => {
  const {
    didIDelegateToMyself,
    delegateeAddress,
    cards,
    isDelegationPending,
    isReclaimPending,
    setIsDelegationPending,
    setIsReclaimPending,
    delegateeRns,
    delegateeImageIpfs,
    delegateeDelegatedSince,
    refetch,
  } = useDelegateContext()

  const { address: ownAddress } = useAccount()
  const { onDelegate } = useDelegateToAddress()

  const [shouldShowDelegates, setShouldShowDelegates] = useState(false)
  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [isReclaimModalOpened, setIsReclaimModalOpened] = useState(false)

  // TODO: move these states to the context
  const [isRequestingDelegate, setIsRequestingDelegate] = useState(false) // opening metamask
  const [isRequestingReclaim, setIsRequestingReclaim] = useState(false) // opening metamask
  const [addressToDelegate, setAddressToDelegate] = useState<Address | null>(null)
  const [rnsToDelegate, setRnsToDelegate] = useState<string | undefined>(undefined)
  const [imageIpfsToDelegate, setImageIpfsToDelegate] = useState<string | null | undefined>(undefined)
  const delegatesContainerRef = useRef<HTMLDivElement>(null)

  const handleDelegate = useCallback(
    (address: Address) => {
      setIsRequestingDelegate(true)
      executeTxFlow({
        onRequestTx: () => onDelegate(address),
        onPending: () => {
          setIsDelegationPending(true)
          setIsDelegateModalOpened(false)
        },
        onSuccess: () => {
          refetch()
          onHideDelegates()
        },
        onComplete: () => {
          setIsDelegationPending(false)
          setIsRequestingDelegate(false)
        },
        action: 'delegation',
      })
    },
    [onDelegate, setIsDelegationPending, setIsDelegateModalOpened, refetch],
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
      onComplete: () => {
        setIsReclaimPending(false)
        setIsRequestingReclaim(false)
      },
      action: 'reclaiming',
    })
  }, [onDelegate, ownAddress, setIsReclaimPending, setIsReclaimModalOpened, refetch])

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
    setTimeout(() => {
      delegatesContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 1)
  }
  const onHideDelegates = () => {
    setShouldShowDelegates(false)
  }

  const onShowDelegate = (address: Address, rns?: string, imageIpfs?: string | null) => {
    setIsDelegateModalOpened(true)
    setAddressToDelegate(address)
    setRnsToDelegate(rns)
    setImageIpfsToDelegate(imageIpfs)
  }

  const onCloseDelegateModal = () => {
    setIsDelegateModalOpened(false)
    setAddressToDelegate(null)
    setRnsToDelegate(undefined)
    setImageIpfsToDelegate(undefined)
  }

  const onShowReclaim = () => {
    setIsReclaimModalOpened(true)
  }

  const votingPower = formatNumberWithCommas(Number(cards.own.contentValue))

  const isPendingTx = isDelegationPending || isReclaimPending
  const isDelegatedToOther = !didIDelegateToMyself && delegateeAddress

  const delegateeAddressToShow = useMemo(() => {
    if (isReclaimPending) {
      return delegateeAddress
    }
    if (isDelegationPending) {
      return addressToDelegate
    }
    return addressToDelegate || (isDelegatedToOther && delegateeAddress)
  }, [isDelegationPending, isReclaimPending, addressToDelegate, delegateeAddress, isDelegatedToOther])

  const delegateeRnsToShow = useMemo(() => {
    if (isReclaimPending) {
      return delegateeRns
    }
    if (isDelegationPending) {
      return rnsToDelegate
    }
    return rnsToDelegate || delegateeRns
  }, [isDelegationPending, isReclaimPending, rnsToDelegate, delegateeRns])

  const delegateeImageIpfsToShow = useMemo(() => {
    if (isReclaimPending) {
      return delegateeImageIpfs
    }
    if (isDelegationPending) {
      return imageIpfsToDelegate
    }
    return imageIpfsToDelegate || delegateeImageIpfs
  }, [isDelegationPending, isReclaimPending, imageIpfsToDelegate, delegateeImageIpfs])

  // Prevent double clicking by disabling action button while opening metamask
  const isPendingDelegate = isDelegationPending || isRequestingDelegate
  const isPendingReclaim = isReclaimPending || isRequestingReclaim

  return (
    <>
      {delegateeAddressToShow && (
        <DelegationDetailsSection
          delegateeAddress={delegateeAddressToShow}
          delegateeRns={delegateeRnsToShow}
          delegateeImageIpfs={delegateeImageIpfsToShow}
          isReclaimPending={isReclaimPending}
          isDelegationPending={isDelegationPending}
          onShowReclaim={onShowReclaim}
          onShowDelegates={onShowDelegates}
        />
      )}
      {!isPendingTx && (
        <div
          ref={delegatesContainerRef}
          className={cn(
            'transition-all duration-300 overflow-hidden',
            shouldShowDelegates || didIDelegateToMyself ? 'max-h-[100%] opacity-100' : 'max-h-0 opacity-0',
          )}
        >
          <DelegatesContainer
            didIDelegateToMyself={didIDelegateToMyself}
            onDelegate={onShowDelegate}
            onCloseClick={onHideDelegates}
          />
        </div>
      )}
      {isDelegateModalOpened && addressToDelegate && (
        <DelegateModal
          onDelegate={handleDelegate}
          onClose={onCloseDelegateModal}
          isLoading={isPendingDelegate}
          title={`You are about to delegate your own voting power of ${votingPower} to`}
          address={addressToDelegate}
          name={rnsToDelegate}
          imageIpfs={imageIpfsToDelegate}
          actionButtonText={isPendingDelegate ? 'Delegating...' : 'Delegate'}
          data-testid="delegateModal"
        />
      )}
      {isReclaimModalOpened && (
        <DelegateModal
          onDelegate={handleReclaim}
          onClose={() => setIsReclaimModalOpened(false)}
          isLoading={isPendingReclaim}
          title={`You are about to reclaim your own voting power of ${votingPower} from`}
          name={delegateeRns}
          address={delegateeAddress as Address}
          since={formatTimestampToMonthYear(delegateeDelegatedSince) || ''}
          imageIpfs={delegateeImageIpfs}
          actionButtonText={isPendingReclaim ? 'Reclaiming...' : 'Reclaim'}
          data-testid="reclaimModal"
        />
      )}
    </>
  )
}
