import { formatEther } from 'viem'
import Big from 'big.js'
import { Header, Span } from '@/components/TypographyNew'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { Button } from '@/components/ButtonNew'
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
    <div className={cn('pr-5', className)}>
      <Span variant="tag" className="text-disabled-border">
        Your total voting power
      </Span>
      <Header variant="h1" className="mt-4">
        {formatNumberWithCommas(Big(formatEther(votingPower)).round(0))}
      </Header>
      <Button
        onClick={buttonAction.onButtonClick}
        className={cn('mt-6 bg-transparent border-bg-0', buttonClassName)}
        textClassName={cn('text-white', buttonTextClassName)}
      >
        {buttonAction.actionName}
      </Button>
    </div>
  )
}
