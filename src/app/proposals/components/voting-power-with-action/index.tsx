import { formatEther } from 'viem'
import Big from 'big.js'
import { Header, Span } from '@/components/Typography'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { Button } from '@/components/Button'
import { ClassNameValue } from 'tailwind-merge'
import { ButtonAction } from '../vote-details'

interface Props {
  votingPower: bigint
  buttonAction: ButtonAction
  className?: ClassNameValue
  buttonClassName?: ClassNameValue
  buttonTextClassName?: ClassNameValue
}

export const VotingPowerWithActionComponent = ({
  votingPower,
  buttonAction,
  className,
  buttonClassName,
  buttonTextClassName,
}: Props) => {
  return (
    <div className={cn('flex flex-col gap-3 pr-5', className)}>
      <Span variant="tag" className="text-disabled-border">
        Your total voting power
      </Span>
      <Header variant="h1">{formatNumberWithCommas(Big(formatEther(votingPower)).round(0))}</Header>
      <Button
        onClick={buttonAction.onButtonClick}
        className={cn('bg-transparent border-bg-0', buttonClassName)}
        textClassName={cn('text-white', buttonTextClassName)}
      >
        {buttonAction.actionName}
      </Button>
    </div>
  )
}
