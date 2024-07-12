import { StakePreview } from '@/app/user/Stake/StakePreview'
import { StepProps } from '@/app/user/Stake/types'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { useMemo } from 'react'

export const StepTwo = ({ onGoNext, onCloseModal }: StepProps) => {
  const {
    amount,
    setStakeTxHash,
    tokenToSend,
    tokenToReceive,
    amountDataToReceive,
    actionToUse,
    actionName,
  } = useStakingContext()

  const {
    shouldEnableConfirm,
    onConfirm: onConfirmAction,
    customFooter,
  } = actionToUse(amount, tokenToSend.contract, tokenToReceive.contract)

  const from = useMemo(
    () => ({
      amount,
      amountConvertedToCurrency: 'USD ' + (Number(tokenToSend.price) * Number(amount) ?? 0).toString(),
      balance: tokenToSend.balance,
      tokenSymbol: tokenToSend.symbol,
    }),
    [amount, tokenToSend.balance, tokenToSend.price, tokenToSend.symbol],
  )

  const to = useMemo(
    () => ({
      amount: amountDataToReceive.amountToReceive.toString(),
      amountConvertedToCurrency: 'USD ' + amountDataToReceive.amountToReceiveConvertedToCurrency.toString(),
      balance: tokenToReceive.balance,
      tokenSymbol: tokenToReceive.symbol,
    }),
    [
      amountDataToReceive.amountToReceive,
      amountDataToReceive.amountToReceiveConvertedToCurrency,
      tokenToReceive.balance,
      tokenToReceive.symbol,
    ],
  )

  const onConfirm = async () => {
    try {
      const txHash = await onConfirmAction()
      if (setStakeTxHash) {
        setStakeTxHash(txHash)
      }
      onGoNext?.()
    } catch (errorConfirming) {
      console.log(errorConfirming) // @TODO implement error handling
    }
  }

  return (
    <StakePreview
      onConfirm={onConfirm}
      onCancel={onCloseModal ? onCloseModal : () => {}}
      from={from}
      to={to}
      disableConfirm={!shouldEnableConfirm}
      customComponentBeforeFooter={customFooter}
      actionName={actionName}
    />
  )
}
