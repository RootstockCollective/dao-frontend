'use client'
import Image from 'next/image'
import { useRef } from 'react'

import { DelegateCard } from '@/app/delegate/components/DelegateCard'
import { formatTimestampToMonthYear } from '@/app/proposals/shared/utils'
import { Button } from '@/components/Button'
import { EditIconKoto } from '@/components/Icons'
import {
  BANNER_DEFAULT_ARTWORK,
  BANNER_DESKTOP_OVERLAY,
  BANNER_MOBILE_OVERLAY,
  BannerDecorativeSquares,
} from '@/components/PageBanner'
import { Header, Paragraph, Span } from '@/components/Typography'
import { shortAddress } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

import { useDelegateContext } from '../../contexts/DelegateContext'

interface Props {
  onShowReclaim: () => void
  onShowDelegates: () => void
}

/**
 * Component that displays delegation details including the delegate card and perks banner.
 * Shows delegate information like address, RNS name, voting power, etc.
 * Allows users to reclaim their delegation or update their delegate.
 */
export const DelegationDetailsSection = ({ onShowReclaim, onShowDelegates }: Props) => {
  const { displayedDelegatee, isDelegationPending, isReclaimPending } = useDelegateContext()

  const isDesktop = useIsDesktop()
  const delegateCardRef = useRef<HTMLDivElement>(null)
  const updateDelegateButtonRef = useRef<HTMLButtonElement>(null)

  if (!displayedDelegatee) {
    return null
  }

  const { address, rns, imageIpfs, delegatedSince, votingPower, votingWeight, totalVotes, delegators } =
    displayedDelegatee

  const chosenAddress = isDesktop ? address : shortAddress(address)

  return (
    <div ref={delegateCardRef} className="flex flex-col md:flex-row gap-8 bg-bg-80 p-6">
      <DelegateCard
        address={address}
        name={rns}
        imageIpfs={imageIpfs}
        since={formatTimestampToMonthYear(delegatedSince) || ' - '}
        votingPower={votingPower ? Number(votingPower).toFixed(0) : ' - '}
        votingWeight={votingWeight || ' - '}
        totalVotes={totalVotes?.toString() || ' - '}
        delegators={delegators?.toString() || ' - '}
        onDelegate={onShowReclaim}
        buttonText={isReclaimPending ? 'Reclaiming...' : 'Reclaim'}
        buttonVariant="primary"
        data-testid={`delegateCard-${address}`}
        buttonDisabled={isDelegationPending || isReclaimPending}
        isDelegationPending={isDelegationPending}
        isReclaimPending={isReclaimPending}
      />
      <div className="flex w-full flex-col-reverse md:flex-col gap-6">
        {/* Banner here with delegation perks: same artwork, overlays and decorative
            squares as the rest of the banners across the app. */}
        <div className="relative mt-10 w-full overflow-hidden rounded bg-v3-bg-accent-100 text-v3-text-100 md:mb-10 md:mt-0">
          <Image
            src={BANNER_DEFAULT_ARTWORK}
            alt=""
            aria-hidden="true"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 md:hidden" style={{ background: BANNER_MOBILE_OVERLAY }} />
          <div className="absolute inset-0 hidden md:block" style={{ background: BANNER_DESKTOP_OVERLAY }} />

          <BannerDecorativeSquares width={24} height={24} className="absolute left-4 top-4 z-base" />

          <div className="relative flex flex-col gap-2 px-4 pb-5 pt-12 md:px-6">
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
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            {isDelegationPending ? (
              <Paragraph>
                Delegating your voting power to <span className="text-primary">{rns || chosenAddress}</span>{' '}
                is pending.
              </Paragraph>
            ) : isReclaimPending ? (
              <Paragraph>
                Reclaiming your voting power from <span className="text-primary">{rns || chosenAddress}</span>{' '}
                is pending.
              </Paragraph>
            ) : (
              <>
                <Paragraph data-testid="DelegateeAddress">
                  You have chosen <span className="text-primary">{rns || chosenAddress}</span> to take part in
                  governance decisions on your behalf.
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
