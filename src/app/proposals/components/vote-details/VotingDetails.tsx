import React from 'react'
import { Button } from '@/components/Button'
import { Popover } from '@/components/Popover'
import { capitalizeFirstLetter } from '@/shared/utils'
import { Header, Paragraph } from '@/components/TypographyNew'

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
      <Paragraph variant="body" className={`text-white text-sm mt-6 text-${disabled && 'disabled-border'}`}>
        {title}
      </Paragraph>
      <Paragraph variant="body" className={`text-lg text-${!disabled ? color : 'text-primary'}`}>
        {value}
      </Paragraph>
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
        <Button onClick={buttonAction.onButtonClick} className="mt-4" textClassName="text-foreground">
          {buttonAction.actionName}
        </Button>
      )}
    </div>
  )
}
