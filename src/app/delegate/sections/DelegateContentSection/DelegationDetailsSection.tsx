'use client'
import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { Header, Paragraph, Span } from '@/components/Typography'
import { Button } from '@/components/Button'
import { Address } from 'viem'
import { useRef } from 'react'
import Image from 'next/image'
import { EditIconKoto } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { cn, shortAddress } from '@/lib/utils'
import { useDelegateContext } from '../../contexts/DelegateContext'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'

interface Props {
  delegateeAddress: Address
  isReclaimPending: boolean
  isDelegationPending: boolean
  onShowReclaim: () => void
  onShowDelegates: () => void
  delegateeRns?: string
  delegateeImageIpfs?: string | null
  delegateeVotingPower?: string
}

/**
 * Component that displays delegation details including the delegate card and perks banner.
 * Shows delegate information like address, RNS name, voting power, etc.
 * Allows users to reclaim their delegation or update their delegate.
 */
export const DelegationDetailsSection = ({
  delegateeAddress,
  isReclaimPending,
  isDelegationPending,
  onShowReclaim,
  onShowDelegates,
  delegateeRns,
  delegateeImageIpfs,
  delegateeVotingPower,
}: Props) => {
  const { delegateeDelegatedSince, delegateeVotingWeight, delegateeTotalVotes, delegateeDelegators } =
    useDelegateContext()

  const isDesktop = useIsDesktop()
  const delegateCardRef = useRef<HTMLDivElement>(null)
  const updateDelegateButtonRef = useRef<HTMLButtonElement>(null)

  const chosenAddress = isDesktop ? delegateeAddress : shortAddress(delegateeAddress)

  return (
    <div ref={delegateCardRef} className="flex flex-col md:flex-row gap-8 bg-bg-80 p-6">
      <DelegateCard
        address={delegateeAddress}
        name={delegateeRns}
        imageIpfs={delegateeImageIpfs}
        since={formatTimestampToMonthYear(delegateeDelegatedSince) || ' - '}
        votingPower={delegateeVotingPower ? Number(delegateeVotingPower).toFixed(0) : ' - '}
        votingWeight={delegateeVotingWeight || ' - '}
        totalVotes={delegateeTotalVotes?.toString() || ' - '}
        delegators={delegateeDelegators?.toString() || ' - '}
        onDelegate={onShowReclaim}
        buttonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
        buttonVariant="primary"
        data-testid={`delegateCard-${delegateeAddress}`}
        buttonDisabled={isDelegationPending || isReclaimPending}
        isDelegationPending={isDelegationPending}
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
            {isDelegationPending ? (
              <Paragraph>
                Delegating your voting power to{' '}
                <span className="text-primary">{delegateeRns || chosenAddress}</span> is pending.
              </Paragraph>
            ) : (
              <>
                <Paragraph data-testid="DelegateeAddress">
                  You have chosen <span className="text-primary">{delegateeRns || chosenAddress}</span> to
                  take part in governance decisions on your behalf.
                </Paragraph>
                <Paragraph>You only delegated your own voting power, not your tokens.</Paragraph>
              </>
            )}
          </div>
          {!isDelegationPending && (
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
          )}
        </div>
      </div>
    </div>
  )
}
