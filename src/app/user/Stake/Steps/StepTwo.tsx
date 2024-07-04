import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { useMemo } from 'react'

export const StepTwo = ({ onGoNext, onCloseModal }: StepProps) => {
  const { amount, prices, balances, symbolUsed } = useStakingContext()
  // We always assume we're staking RIF (RIF to STRIF)
  const from = useMemo(
    () => ({
      amount,
      amountConvertedToCurrency: '$ USD ' + (prices['rif'].price * Number(amount) ?? 0).toString(),
      balance: balances.rif.balance ?? 0,
      tokenName: symbolUsed,
      tokenSymbol: symbolUsed,
    }),
    [amount, balances.rif.balance, prices, symbolUsed],
  )

  const to = useMemo(
    () => ({
      amount, // TODO: Multiply token amount by equivalency price (e.g., 1 RIF * 2 stRIF = 2 stRIF)
      amountConvertedToCurrency: '$ USD ' + (prices['strif'].price * Number(amount) ?? 0).toString(),
      balance: balances.strif.balance ?? 0,
      tokenName: 'stRIF',
      tokenSymbol: 'stRIF',
    }),
    [amount, balances.strif.balance, prices],
  )

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
      to={to}
    />
  )
}
