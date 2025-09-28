'use client'
import { DelegatesContainer } from '@/app/delegate/sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { DelegationDetailsSection } from '@/app/delegate/sections/DelegateContentSection/DelegationDetailsSection'
import { Address } from 'viem'
import { useCallback, useRef, useState } from 'react'
import { DelegateModal } from '@/app/delegate/components/DelegateModal'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { executeTxFlow } from '@/shared/notification/executeTxFlow'
import { useAccount } from 'wagmi'
import { formatNumberWithCommas } from '@/lib/utils'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'

export const ConnectedSection = () => {
  const {
    didIDelegateToMyself,
    delegateeAddress,
    cards,
    isDelegationPending,
    isReclaimPending,
    setIsDelegationPending,
    setIsReclaimPending,
    delegateeVotingPower,
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
  const [addressToDelegate, setAddressToDelegate] = useState<Address | null>(null)
  const [rnsToDelegate, setRnsToDelegate] = useState<string | undefined>(undefined)
  const [imageIpfsToDelegate, setImageIpfsToDelegate] = useState<string | null | undefined>(undefined)
  const delegatesContainerRef = useRef<HTMLDivElement>(null)

  const handleDelegate = useCallback(
    (address: Address) => {
      executeTxFlow({
        onRequestTx: () => onDelegate(address),
        onPending: () => {
          setIsDelegationPending(true)
          setIsDelegateModalOpened(false)
        },
        onSuccess: refetch,
        onComplete: () => setIsDelegationPending(false),
        action: 'delegation',
      })
    },
    [onDelegate, setIsDelegationPending, setIsDelegateModalOpened, refetch],
  )

  const handleReclaim = useCallback(() => {
    executeTxFlow({
      onRequestTx: () => onDelegate(ownAddress as Address),
      onPending: () => {
        setIsReclaimPending(true)
        setIsReclaimModalOpened(false)
      },
      onSuccess: refetch,
      onComplete: () => setIsReclaimPending(false),
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
  const delegateeAddressToShow = ((isDelegatedToOther && delegateeAddress) || addressToDelegate) as Address

  return (
    <>
      {delegateeAddressToShow && (
        <DelegationDetailsSection
          delegateeAddress={delegateeAddressToShow}
          delegateeRns={delegateeRns}
          delegateeImageIpfs={delegateeImageIpfs}
          delegateeVotingPower={delegateeVotingPower}
          isReclaimPending={isReclaimPending}
          isDelegationPending={isDelegationPending}
          onShowReclaim={onShowReclaim}
          onShowDelegates={onShowDelegates}
        />
      )}
      {!isPendingTx && (
        <div
          ref={delegatesContainerRef}
          className={`transition-all duration-300 overflow-hidden ${
            shouldShowDelegates || didIDelegateToMyself ? 'max-h-[100%] opacity-100' : 'max-h-0 opacity-0'
          }`}
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
          isLoading={isDelegationPending}
          title={`You are about to delegate your own voting power of ${votingPower} to`}
          address={addressToDelegate}
          name={rnsToDelegate}
          imageIpfs={imageIpfsToDelegate}
          actionButtonText={isDelegationPending ? 'Delegating...' : 'Delegate'}
          data-testid="delegateModal"
        />
      )}
      {isReclaimModalOpened && (
        <DelegateModal
          onDelegate={handleReclaim}
          onClose={() => setIsReclaimModalOpened(false)}
          isLoading={isReclaimPending}
          title={`You are about to reclaim your own voting power of ${votingPower} from`}
          name={delegateeRns}
          address={delegateeAddress as Address}
          since={formatTimestampToMonthYear(delegateeDelegatedSince) || ''}
          imageIpfs={delegateeImageIpfs}
          actionButtonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
          data-testid="reclaimModal"
        />
      )}
    </>
  )
}
