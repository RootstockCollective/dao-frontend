import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { useMemo } from 'react'

const TEST_TO = {
  amountToSend: '0.44',
  amountToSendConverted: 'USD 40.20',
  balance : '2,323.00',
  tokenName: 'stRIF',
  tokenSymbol: 'stRIF',
}

export const StepTwo = ({ onGoNext, onCloseModal }: StepProps) => {
  const { amount, prices, balances } = useStakingContext()
  // We always assume we're staking RIF (RIF to STRIF)
  const from = useMemo(() => ({
    amountToSend: amount,
    amountToSendConverted: (prices['rif'].price * Number(amount) ?? 0).toString(),
    balance: balances.rif.balance ?? 0,
    tokenName: 'RIF',
    tokenSymbol: 'RIF'
  }), [amount, balances.rif.balance, prices])
  
  const onConfirm = () => {
    // @TODO use sendTransaction, wait for user to confirm transaction, then go to next
    // If user didn't confirm transaction then go back
    if (true) {
      // TODO set TX id and status in Context
      onGoNext?.()
    }
  }
  return (
    <StakePreview
      onConfirm={onConfirm}
      onCancel={onCloseModal ? onCloseModal : () => {}}
      from={from}
      to={TEST_TO}
    />
  )
}
