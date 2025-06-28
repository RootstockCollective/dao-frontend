import React from 'react'
import { formatEther } from 'viem'
import { Button } from '@/components/ButtonNew/Button'
import { Popover } from '@/components/Popover'
import { capitalizeFirstLetter } from '@/shared/utils'
import { Header, Paragraph } from '@/components/TypographyNew'
import { formatNumberWithCommas } from '@/lib/utils'
import Big from 'big.js'

interface VoteCounterProps {
  title: string
  value: bigint
  color: string
  disabled?: boolean
}

export const VoteCounter = ({ title, value, color, disabled }: VoteCounterProps) => {
  return (
    <div
      className={`bg-[#37322F] pl-4 pb-3 rounded-[4px] flex flex-col items-start justify-center w-40 border-t-4 border-${!disabled ? color : 'disabled-border'}`}
    >
      <Paragraph variant="body" className={`text-white text-sm mt-6 text-${disabled && 'disabled-border'}`}>
        {title}
      </Paragraph>
      <Paragraph variant="body" className={`text-lg text-${!disabled ? color : 'text-primary'}`}>
        {formatNumberWithCommas(Big(formatEther(value)).round(0))}
      </Paragraph>
    </div>
  )
}

type HasVoted = 'for' | 'abstain' | 'against'

export interface ButtonAction {
  onButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void
  actionName: string
}

interface VoteDetailsProps {
  votingPower: string
  voteData: {
    for: bigint
    against: bigint
    abstain: bigint
    quorum: bigint
  }
  buttonAction?: ButtonAction
  hasVoted?: HasVoted
  actionDisabled?: boolean
  voteButtonRef?: React.Ref<HTMLButtonElement>
}

const colorMap = new Map([
  ['for', 'st-success'],
  ['abstain', 'st-warning'],
  ['against', 'st-error'],
])

export const VotingDetails = ({
  voteData,
  votingPower,
  buttonAction,
  hasVoted,
  actionDisabled,
  voteButtonRef,
}: VoteDetailsProps) => {
  return (
    <div className="bg-[#25211E] p-6 rounded-[4px] w-full">
      <Header variant="h3" className="font-normal">
        VOTE DETAILS
      </Header>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(voteData).map(([key, value]) => (
          <VoteCounter
            key={key}
            title={capitalizeFirstLetter(key)}
            value={value}
            color={colorMap.get(key.toLowerCase())!}
            disabled={hasVoted && hasVoted !== key}
          />
        ))}
      </div>

      {/* Available Voting Power section */}
      <div className="mt-6">
        {!hasVoted ? (
          <>
            <div className="flex items-center text-sm">
              <Paragraph className="mr-2 text-[16px] text-disabled-border">
                Your available voting power
              </Paragraph>
              <Popover position="top" content={'How much power is available for this proposal'}>
                {'?'}
              </Popover>
            </div>
            <Header className="font-kk-topo font-normal text-[32px]">{votingPower}</Header>
          </>
        ) : (
          <Paragraph variant="body">{`You voted ${hasVoted.toUpperCase()} this proposal. ${!buttonAction ? '' : ' Take the next step now.'}`}</Paragraph>
        )}
      </div>
      {!buttonAction ? null : (
        <Button
          onClick={buttonAction.onButtonClick}
          className="mt-4"
          textClassName="text-foreground"
          disabled={actionDisabled}
          ref={voteButtonRef}
        >
          {buttonAction.actionName}
        </Button>
      )}
    </div>
  )
}
