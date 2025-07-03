'use client'
import { DelegatesContainer } from '@/app/delegate/Sections/DelegateContentSection/DelegatesContainer'
import { useDelegateContext } from '@/app/delegate/components/DelegateContext'
import { DelegateCard } from '@/app/delegate/components'
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
  const [shouldShowDelegates, setShouldShowDelegates] = useState(true)
  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [isReclaimModalOpened, setIsReclaimModalOpened] = useState(false)

  // @TODO get from input
  const temporaryAddress = '0xc6cc5b597f80276eae5cb80530acff3e89070a47'
  const { onDelegate } = useDelegateToAddress()

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
      action: 'reclaim',
    })
  }, [onDelegate, myAddress, setIsReclaimPending, setIsReclaimModalOpened])

  const onShowDelegates = () => {
    setShouldShowDelegates(true)
  }

  return (
    <>
      {didIDelegateToMyself && (
        <Button
          variant="primary"
          onClick={() => setIsDelegateModalOpened(true)}
          disabled={isDelegationPending}
        >
          {isDelegationPending ? 'Delegating...' : 'Delegate'}
        </Button>
      )}
      {!didIDelegateToMyself && delegateeAddress && (
        <div className="flex flex-row bg-bg-80 p-[24px]">
          <DelegateCard
            address={delegateeAddress}
            since="May 2025"
            votingPower={0}
            delegators={0}
            votingWeight="0"
            totalVotes="0"
            onDelegate={() => setIsReclaimModalOpened(true)}
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
              behalf.{' '}
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
        <DelegatesContainer didIDelegateToMyself={didIDelegateToMyself} />
      )}
      {isDelegateModalOpened && (
        <DelegateModal
          onDelegate={handleDelegate}
          onClose={() => setIsDelegateModalOpened(false)}
          isLoading={isDelegationPending}
          title={`You are about to delegate your own voting power of ${formatNumberWithCommas(Number(cards.own.contentValue))} to`}
          address={temporaryAddress}
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
          since="your delegate since December 31, 2024"
          actionButtonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
        />
      )}
    </>
  )
}
