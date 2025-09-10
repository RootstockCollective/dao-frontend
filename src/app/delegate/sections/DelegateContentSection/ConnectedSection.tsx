'use client'
import { DelegatesContainer } from '@/app/delegate/sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { Header, Paragraph, Span } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Address } from 'viem'
import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'
import { DelegateModal } from '@/app/delegate/components/DelegateModal'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { executeTxFlow } from '@/shared/notification/executeTxFlow'
import { useAccount } from 'wagmi'
import { cn, formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { EditIconKoto } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

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
    refetch,
  } = useDelegateContext()

  const { address: ownAddress } = useAccount()
  const { onDelegate } = useDelegateToAddress()
  const isDesktop = useIsDesktop()

  const [shouldShowDelegates, setShouldShowDelegates] = useState(false)
  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [isReclaimModalOpened, setIsReclaimModalOpened] = useState(false)
  const [addressToDelegate, setAddressToDelegate] = useState<Address | null>(null)
  const [rnsToDelegate, setRnsToDelegate] = useState<string | undefined>(undefined)
  const delegateCardRef = useRef<HTMLDivElement>(null)
  const delegatesContainerRef = useRef<HTMLDivElement>(null)
  const updateDelegateButtonRef = useRef<HTMLButtonElement>(null)

  const handleDelegate = useCallback(
    (address: Address) => {
      setIsDelegationPending(true)
      executeTxFlow({
        onRequestTx: () => onDelegate(address),
        onPending: () => setIsDelegateModalOpened(false),
        onSuccess: refetch,
        onComplete: () => setIsDelegationPending(false),
        action: 'delegation',
      })
    },
    [onDelegate, setIsDelegationPending, setIsDelegateModalOpened, refetch],
  )

  const handleReclaim = useCallback(() => {
    setIsReclaimPending(true)
    executeTxFlow({
      onRequestTx: () => onDelegate(ownAddress as Address),
      onPending: () => setIsReclaimModalOpened(false),
      onSuccess: refetch,
      onComplete: () => setIsReclaimPending(false),
      action: 'reclaiming',
    })
  }, [onDelegate, ownAddress, setIsReclaimPending, setIsReclaimModalOpened, refetch])

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
    if (!isDesktop) {
      setTimeout(() => {
        delegatesContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 1)
    }
  }
  const onHideDelegates = () => {
    setShouldShowDelegates(false)
    if (!isDesktop) {
      updateDelegateButtonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }

  const onShowDelegate = (address: Address, rns?: string) => {
    setIsDelegateModalOpened(true)
    setAddressToDelegate(address)
    setRnsToDelegate(rns)
  }

  const onShowReclaim = () => {
    setIsReclaimModalOpened(true)
  }

  const votingPower = formatNumberWithCommas(Number(cards.own.contentValue))

  const shouldDisableButtons = isDelegationPending || isReclaimPending
  const chosenAddress = isDesktop ? delegateeAddress : shortAddress(delegateeAddress)

  return (
    <>
      {!didIDelegateToMyself && delegateeAddress && (
        <div ref={delegateCardRef} className="flex flex-col md:flex-row gap-8 bg-bg-80 p-6">
          <DelegateCard
            address={delegateeAddress}
            name={delegateeRns}
            // @TODO fetch since
            since=" - "
            votingPower={delegateeVotingPower ? Number(delegateeVotingPower).toFixed(0) : ' - '}
            // @TODO fetch voting weight
            votingWeight=" - "
            // @TODO fetch total votes
            totalVotes=" - "
            // @TODO fetch delegators
            delegators=" - "
            onDelegate={onShowReclaim}
            buttonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
            buttonVariant="primary"
            data-testid={`delegateCard-${delegateeAddress}`}
            buttonDisabled={shouldDisableButtons}
          />
          <div className="flex w-full flex-col-reverse md:flex-col gap-6">
            {/* Banner here with delegation perks */}
            <div className="text-bg-100 p-6 mt-10 md:mt-0 md:mb-10 relative bg-gradient-to-r from-[#E3FFEB] via-[#66CD8E] to-[#00031E]">
              <Image
                src="/images/hero/delegation-perks-pixels.svg"
                alt="Pixels Divider"
                width={50}
                height={40}
                className={cn(
                  'absolute left-0 z-10 md:left-0 scale-y-[-1] md:scale-y-100',
                  isDesktop ? '-bottom-[30px]' : '-top-[30px]',
                )}
              />
              <Header variant="h3">DELEGATION PERKS</Header>
              <ul className="list-[circle] list-inside">
                <li>
                  <Span>your tokens stay in your wallet</Span>
                </li>
                <li>
                  <Span>you save on gas cost while being represented</Span>
                </li>
                <li>
                  <Span>your Rewards will keep accumulating as usual</Span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Paragraph data-testid="DelegateeAddress">
                  You have chosen <span className="text-primary">{delegateeRns || chosenAddress}</span> to
                  take part in governance decisions on your behalf.
                </Paragraph>
                <Paragraph>You only delegated your own voting power, not your tokens.</Paragraph>
              </div>
              <Button
                ref={updateDelegateButtonRef}
                variant="secondary-outline"
                onClick={onShowDelegates}
                className="gap-1 hover:border-primary"
                data-testid="updateDelegateButton"
              >
                <EditIconKoto size={20} />
                <Span variant="body-s">Update delegate</Span>
              </Button>
            </div>
          </div>
        </div>
      )}
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
          shouldDisableButtons={shouldDisableButtons}
        />
      </div>
      {isDelegateModalOpened && addressToDelegate && (
        <DelegateModal
          onDelegate={handleDelegate}
          onClose={() => setIsDelegateModalOpened(false)}
          isLoading={isDelegationPending}
          title={`You are about to delegate your own voting power of ${votingPower} to`}
          address={addressToDelegate}
          name={rnsToDelegate}
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
          address={delegateeAddress as Address}
          // @TODO fetch since
          since=""
          actionButtonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
          data-testid="reclaimModal"
        />
      )}
    </>
  )
}
