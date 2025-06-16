import React from 'react'
import { Button } from '@/components/Button'
import { Typography } from '@/components/TypographyNew/Typography'
import { Popover } from '@/components/Popover'
import { capitalizeFirstLetter } from '@/shared/utils'

interface VoteCounterProps {
  title: string
  value: string
  color: string
  disabled?: boolean
}

export const VoteCounter = ({ title, value, color, disabled }: VoteCounterProps) => {
  return (
    <div
      className={`bg-[#37322F] pl-4 pb-3 rounded-[4px] flex flex-col items-start justify-center w-40 border-t-4 border-${!disabled ? color : 'disabled-border'}`}
    >
      <Typography tagVariant="p" className={`text-white text-sm mt-6 text-${disabled && 'disabled-border'}`}>
        {title}
      </Typography>
      <Typography tagVariant="p" className={`text-lg text-${!disabled ? color : 'text-primary'}`}>
        {value}
      </Typography>
    </div>
  )
}

type HasVoted = 'for' | 'abstain' | 'against'

interface VoteDetailsProps {
  votingPower: string
  voteData: {
    for: string
    against: string
    abstain: string
    quorum: string
  }
  buttonAction?: {
    onButtonClick: (event: React.MouseEvent<HTMLButtonElement>) => void
    actionName: string
  }
  hasVoted?: HasVoted
}

const colorMap = new Map([
  ['for', 'st-success'],
  ['abstain', 'st-warning'],
  ['against', 'st-error'],
])

export const VotingDetails = ({ voteData, votingPower, buttonAction, hasVoted }: VoteDetailsProps) => {
  return (
    <div className="bg-[#25211E] p-6 rounded-[4px] max-w-[376px] max-h-[422px]">
      <Typography tagVariant="h3">VOTE DETAILS</Typography>

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
              <Typography className="mr-2 text-[16px]" color={'#ACA39D'}>
                Your available voting power
              </Typography>
              <Popover position="top" content={'How much power is available for this proposal'}>
                {'?'}
              </Popover>
            </div>
            <Typography tagVariant="h1" className="font-kk-topo font-normal text-[32px]">
              {votingPower}
            </Typography>
          </>
        ) : (
          <Typography>{`You voted ${hasVoted.toUpperCase()} this proposal. ${!buttonAction ? '' : ' Take the next step now.'}`}</Typography>
        )}
      </div>
      {!buttonAction ? null : (
        <Button onClick={buttonAction.onButtonClick} className="mt-4" textClassName="text-foreground">
          {buttonAction.actionName}
        </Button>
      )}
    </div>
  )
}
