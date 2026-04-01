import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { executeTxFlow } from '@/shared/notification'
import { useEffect } from 'react'
import { StakeTokenAmountDisplay } from '../components/StakeTokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useStakeRIF } from '../hooks/useStakeRIF'

export const StepThree = ({ onGoToStep, onCloseModal }: StepProps) => {
  const {
    amount,
    tokenToReceive,
    stakePreviewFrom: from,
    stakePreviewTo: to,
    setButtonActions,
  } = useStakingContext()
  const { onRequestStake, isRequesting, isTxPending, isTxFailed, stakeTxHash } = useStakeRIF(
    amount,
    tokenToReceive.contract,
  )
  const { refetchBalances } = useGetAddressBalances()

  // Set button actions directly
  useEffect(() => {
    setButtonActions({
      primary: {
        label: isRequesting ? 'Requesting...' : 'Confirm stake',
        onClick: () => {
          executeTxFlow({
            onRequestTx: onRequestStake,
            onSuccess: () => {
              refetchBalances()
              onCloseModal()
            },
            action: 'staking',
          })
        },
        disabled: !amount || Number(amount) <= 0,
        loading: isRequesting,
        isTxPending: isTxPending,
      },
      secondary: {
        label: 'Back',
        onClick: () => onGoToStep(0), // Go back to Step One
        disabled: false,
        loading: false,
      },
    })
  }, [
    amount,
    isRequesting,
    isTxPending,
    onRequestStake,
    onCloseModal,
    onGoToStep,
    setButtonActions,
    refetchBalances,
  ])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <StakeTokenAmountDisplay
          label="From"
          amount={amount}
          tokenSymbol={from.tokenSymbol}
          amountInCurrency={from.amountConvertedToCurrency}
          balance={from.balance}
        />
        <StakeTokenAmountDisplay
          label="To"
          amount={amount}
          tokenSymbol={to.tokenSymbol}
          balance={to.balance}
          isFlexEnd
        />
      </div>

      <TransactionStatus txHash={stakeTxHash} isTxFailed={isTxFailed} failureMessage="Stake TX failed." />
    </>
  )
}
