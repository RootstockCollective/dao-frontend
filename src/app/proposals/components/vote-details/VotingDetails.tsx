import { MouseEvent, Ref } from 'react'
import { formatEther } from 'viem'
import { Button } from '@/components/ButtonNew/Button'
import { capitalizeFirstLetter } from '@/shared/utils'
import { Header, Paragraph } from '@/components/TypographyNew'
import { formatNumberWithCommas } from '@/lib/utils'
import { Vote } from '@/shared/types'
import { HourglassAnimatedIcon } from '@/components/Icons/HourglassAnimatedIcon'
import Big from '@/lib/big'
import { BalanceInfo } from '@/components/BalanceInfo'

interface VoteCounterProps {
  title: string
  value: bigint
  color: string
  disabled?: boolean
  isVotingInProgress?: boolean
}

export const VoteCounter = ({ title, value, color, disabled, isVotingInProgress }: VoteCounterProps) => {
  return (
    <div
      className={`bg-[#37322F] pl-4 pb-3 rounded-[4px] flex flex-col items-start justify-center w-40 border-t-4 border-${!disabled ? color : 'disabled-border'}`}
    >
      <Paragraph variant="body" className={`text-white text-sm mt-6 text-${disabled && 'disabled-border'}`}>
        {title}
      </Paragraph>
      <div className="flex flex-row items-center">
        <Paragraph variant="body" className={`text-lg text-${!disabled ? color : 'text-primary'}`}>
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
  isConnected?: boolean
}

const colorMap = new Map([
  ['for', 'st-success'],
  ['abstain', 'st-warning'],
  ['against', 'st-error'],
])

const VOTE_TYPES = ['for', 'against', 'abstain'] as const

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
}: VoteDetailsProps) => {
  return (
    <div className="bg-[#25211E] p-6 rounded-[4px] w-full max-w-[376px]">
      <Header variant="h3" className="font-normal">
        {isChoosingVote ? 'CAST YOUR VOTE' : 'VOTE DETAILS'}
      </Header>

      {/* Vote counters or voting buttons */}
      {!isChoosingVote ? (
        <div className="grid grid-cols-2 gap-2 mt-4">
          {Object.entries(voteData).map(([key, value]) => (
            <VoteCounter
              key={key}
              title={capitalizeFirstLetter(key)}
              value={value}
              color={colorMap.get(key)!}
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
              onClick={() => onCastVote && onCastVote(voteType)}
              className={'px-4 py-3 w-[104px] border-0'}
              style={{
                background: `var(--${colorMap.get(voteType)})`,
              }}
              textClassName="text-black"
              disabled={actionDisabled}
            >
              {capitalizeFirstLetter(voteType)}
            </Button>
          ))}
        </div>
      )}

      {/* Voting power block (always rendered once) */}
      <div className="mt-6">
        {!vote ? (
          <BalanceInfo
            title={'Your available voting power'}
            tooltipContent={'How much power is available for this proposal'}
            amount={formatNumberWithCommas(Big(formatEther(votingPower)).round(0))}
          />
        ) : (
          <Paragraph variant="body">{`You voted ${vote.toUpperCase()} this proposal. ${!buttonAction ? '' : ' Take the next step now.'}`}</Paragraph>
        )}
      </div>

      {/* Action button (Vote on proposal, custom, or Cancel) always rendered here */}
      <div>
        {isChoosingVote ? (
          <Button variant="secondary-outline" className="mt-6" onClick={onCancelVote}>
            Cancel
          </Button>
        ) : (
          buttonAction && (
            <Button
              onClick={buttonAction.onButtonClick}
              className="mt-6"
              textClassName="text-foreground"
              disabled={actionDisabled}
              ref={voteButtonRef}
            >
              {buttonAction.actionName}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
