import type { MouseEvent, Ref } from 'react'
import { formatEther } from 'viem'
import { Button } from '@/components/Button'
import { Header, Paragraph } from '@/components/Typography'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import type { Vote } from '@/shared/types'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'
import Big from '@/lib/big'
import { BalanceInfo } from '@/components/BalanceInfo'
import type { Eta } from '@/app/proposals/shared/types'
import { Countdown } from '@/components/Countdown'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { Divider } from '@/components/Divider'

interface VoteCounterProps {
  title: string
  value: bigint
  color: string
  disabled?: boolean
  isVotingInProgress?: boolean
}

const VoteCounter = ({ title, value, color, disabled, isVotingInProgress }: VoteCounterProps) => {
  return (
    <div
      className={cn(
        'bg-bg-60 pl-4 pb-3 rounded-[4px] flex flex-col items-start justify-center md:w-40 border-t-4',
        disabled ? 'border-disabled-border' : `border-${color}`,
      )}
    >
      <Paragraph
        variant="body"
        className={cn('text-text-100 text-sm mt-6 capitalize', {
          'text-disabled-border': disabled,
        })}
      >
        {title}
      </Paragraph>
      <div className="flex items-center">
        <Paragraph variant="body" className={cn('text-lg', disabled ? 'text-primary' : `text-${color}`)}>
          {formatNumberWithCommas(Big(formatEther(value)).round(0))}
        </Paragraph>
        {isVotingInProgress && (
          <HourglassAnimatedIcon className="ml-0.5" size={16} color="var(--disabled-border)" />
        )}
      </div>
    </div>
  )
}

type ActionName = 'Vote on proposal' | 'Put on queue' | 'Execute' | 'View proposal'

export interface ButtonAction {
  actionName: ActionName
  onButtonClick?: (event: MouseEvent<HTMLButtonElement>) => void
}

interface VoteDetailsProps {
  votingPower: bigint
  voteData: {
    for: bigint
    against: bigint
    abstain: bigint
    quorum: bigint
  }
  isChoosingVote?: boolean
  isVotingInProgress?: boolean
  buttonAction?: ButtonAction
  vote?: Vote
  actionDisabled?: boolean
  voteButtonRef?: Ref<HTMLButtonElement>
  onCastVote?: (vote: 'for' | 'against' | 'abstain') => void
  onCancelVote?: () => void
  eta?: Eta
}

const COLOR_MAP = {
  for: 'st-success',
  abstain: 'st-warning',
  against: 'st-error',
} as const satisfies Record<Vote, string>
const VOTE_TYPES = Object.keys(COLOR_MAP) as Vote[]

export const VotingDetails = ({
  voteData,
  votingPower,
  buttonAction,
  vote,
  actionDisabled,
  voteButtonRef,
  onCastVote,
  onCancelVote,
  isVotingInProgress,
  isChoosingVote,
  eta,
}: VoteDetailsProps) => {
  const isDesktop = useIsDesktop()
  return (
    <div className="w-full p-4 pt-20 rounded-sm bg-bg-80 md:p-6 md:max-w-[376px] md:pt-6">
      <Header variant={!isDesktop ? 'h1' : 'h3'} className="font-normal">
        {isChoosingVote ? 'CAST YOUR VOTE' : 'VOTE DETAILS'}
      </Header>

      {/* Vote counters or voting buttons */}
      {!isChoosingVote ? (
        <div className="grid grid-cols-2 gap-2 md:mt-4 mt-6">
          {Object.entries(voteData).map(([key, value]) => (
            <VoteCounter
              key={key}
              title={key}
              value={value}
              color={COLOR_MAP[key as Vote]}
              disabled={vote && vote !== key}
              isVotingInProgress={isVotingInProgress && vote === key}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-4 mt-8">
          {VOTE_TYPES.map(voteType => (
            <Button
              key={voteType}
              onClick={() => onCastVote?.(voteType)}
              className="px-4 py-3 flex-1 border-0"
              style={{
                background: `var(--${COLOR_MAP[voteType]})`,
              }}
              textClassName="text-black capitalize"
              disabled={actionDisabled}
            >
              {voteType}
            </Button>
          ))}
        </div>
      )}

      {/* Voting power block */}
      <div className="mt-6">
        {!vote ? (
          <BalanceInfo
            title="Your available voting power"
            tooltipContent="How much power is available for this proposal"
            amount={formatNumberWithCommas(Big(formatEther(votingPower)).round(0))}
          />
        ) : (
          <Paragraph variant="body">{`You voted ${vote.toUpperCase()} this proposal. ${buttonAction ? ' Take the next step now.' : ''}`}</Paragraph>
        )}
      </div>
      {/* Action button (Vote on proposal, custom, or Cancel) always rendered here */}
      <div className="md:relative absolute bottom-4 inset-x-4 md:inset-auto">
        {!isDesktop && <Divider />}
        {isChoosingVote ? (
          <Button variant="secondary-outline" className="md:mt-6 mt-4" onClick={onCancelVote}>
            Cancel
          </Button>
        ) : buttonAction ? (
          <Button
            onClick={buttonAction.onButtonClick}
            className="md:mt-6 mt-4"
            textClassName="text-foreground"
            disabled={actionDisabled}
            ref={voteButtonRef}
          >
            {buttonAction.actionName}
          </Button>
        ) : (
          eta && (
            <div className="flex md:mt-6 mt-4 items-center">
              <Paragraph variant="body-s" className="first-letter:uppercase">
                {eta.type}
              </Paragraph>
              <Countdown
                end={eta.end}
                timeSource={eta.timeSource}
                referenceStart={eta.referenceStart}
                colorDirection={eta.colorDirection}
                className="w-auto ml-4"
              />
            </div>
          )
        )}
      </div>
    </div>
  )
}
