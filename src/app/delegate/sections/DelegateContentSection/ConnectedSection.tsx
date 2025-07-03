'use client'
import { DelegatesContainer } from '@/app/delegate/sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/contexts/DelegateContext'
import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { Button } from '@/components/ButtonNew'
import { Address } from 'viem'
import { useCallback, useState } from 'react'
import Image from 'next/image'
import { DelegateModal } from '@/app/delegate/components/DelegateModal/DelegateModal'
import { useDelegateToAddress } from '@/shared/hooks/useDelegateToAddress'
import { executeTxFlow } from '@/shared/notification/executeTxFlow'
import { useAccount } from 'wagmi'
import { formatNumberWithCommas } from '@/lib/utils'

export const ConnectedSection = () => {
  const {
    didIDelegateToMyself,
    delegateeAddress,
    cards,
    isDelegationPending,
    isReclaimPending,
    setIsDelegationPending,
    setIsReclaimPending,
  } = useDelegateContext()

  const { address: myAddress } = useAccount()
  const { onDelegate } = useDelegateToAddress()

  const [shouldShowDelegates, setShouldShowDelegates] = useState(false)
  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [isReclaimModalOpened, setIsReclaimModalOpened] = useState(false)
  const [addressToDelegate, setAddressToDelegate] = useState<Address | null>(null)

  const handleDelegate = useCallback(
    (address: Address) => {
      setIsDelegationPending(true)
      executeTxFlow({
        onRequestTx: () => onDelegate(address),
        onPending: () => setIsDelegateModalOpened(false),
        onComplete: () => setIsDelegationPending(false),
        action: 'delegation',
      })
    },
    [onDelegate, setIsDelegationPending, setIsDelegateModalOpened],
  )

  const handleReclaim = useCallback(() => {
    setIsReclaimPending(true)
    executeTxFlow({
      onRequestTx: () => onDelegate(myAddress as Address),
      onPending: () => setIsReclaimModalOpened(false),
      onComplete: () => setIsReclaimPending(false),
      action: 'reclaiming',
    })
  }, [onDelegate, myAddress, setIsReclaimPending, setIsReclaimModalOpened])

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
  }

  const onShowDelegate = (address: Address) => {
    setIsDelegateModalOpened(true)
    setAddressToDelegate(address)
  }

  const onShowReclaim = () => {
    setIsReclaimModalOpened(true)
  }

  return (
    <>
      {!didIDelegateToMyself && delegateeAddress && (
        <div className="flex flex-row bg-bg-80 p-[24px]">
          <DelegateCard
            address={delegateeAddress}
            // @TODO fetch since
            since="May 2025"
            // @TODO fetch voting power
            votingPower={0}
            // @TODO fetch voting weight
            votingWeight={0}
            // @TODO fetch total votes
            totalVotes={0}
            // @TODO fetch delegators
            delegators={0}
            onDelegate={onShowReclaim}
            buttonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
            buttonVariant="primary"
          />
          <div className="flex flex-col ml-[32px] w-full">
            {/* Banner here with delegation perks */}
            <div className="text-bg-100 p-[24px] relative mb-[110px] bg-gradient-to-r from-[#E3FFEB] via-[#66CD8E] to-[#00031E]">
              <Image
                src="/images/banner/delegate-squares.svg"
                alt="Squares Divider"
                width={50}
                height={40}
                className="absolute left-[0px] -bottom-[30px] z-10 hidden md:block"
              />
              <Header variant="e3" className="text-bg-100 leading-[40px] text-[20px]">
                DELEGATION PERKS
              </Header>
              <ul className="list-[circle] list-inside">
                <li>
                  <Span>tokens stay in your wallet</Span>
                </li>
                <li>
                  <Span>you save on gas cost while being represented</Span>
                </li>
                <li>
                  <Span>your Rewards will keep accumulating as usual</Span>
                </li>
              </ul>
            </div>
            <Paragraph>
              You selected <span className="text-primary">{delegateeAddress}</span> to make governance your
              behalf.
            </Paragraph>
            <Paragraph>You only delegated your own voting power, not your tokens.</Paragraph>
            {/* Update delegate button here */}
            <Button
              variant="secondary-outline"
              onClick={onShowDelegates}
              className="w-[fit-content] mt-[24px]"
            >
              {/* Pending edit icon here */}
              Update delegate
            </Button>
          </div>
        </div>
      )}
      {(shouldShowDelegates || didIDelegateToMyself) && (
        <DelegatesContainer didIDelegateToMyself={didIDelegateToMyself} onDelegate={onShowDelegate} />
      )}
      {isDelegateModalOpened && addressToDelegate && (
        <DelegateModal
          onDelegate={handleDelegate}
          onClose={() => setIsDelegateModalOpened(false)}
          isLoading={isDelegationPending}
          title={`You are about to delegate your own voting power of ${formatNumberWithCommas(Number(cards.own.contentValue))} to`}
          address={addressToDelegate}
          actionButtonText={isDelegationPending ? 'Delegating...' : 'Delegate'}
        />
      )}
      {isReclaimModalOpened && (
        <DelegateModal
          onDelegate={handleReclaim}
          onClose={() => setIsReclaimModalOpened(false)}
          isLoading={isReclaimPending}
          title={`You are about to reclaim your own voting power of ${formatNumberWithCommas(Number(cards.own.contentValue))} from`}
          address={delegateeAddress as Address}
          // @TODO fetch since
          since="your delegate since December 31, 2024"
          actionButtonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
        />
      )}
    </>
  )
}
