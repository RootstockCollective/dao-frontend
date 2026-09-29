import posthog from 'posthog-js'
import { useEffect } from 'react'

import {
  StakeBoostEligibilityRow,
  useStakeBoostOutlook,
} from '@/app/collective-rewards/abi-boost/components/StakeBoost'
import { useIsAbiBoostEnabled } from '@/app/collective-rewards/abi-boost/hooks/useAbiBoost'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { isUserRejectedTxError, txFailureProps } from '@/components/ErrorPage/commonErrors'
import { executeTxFlow } from '@/shared/notification'

import { StakeTokenAmountDisplay } from '../components/StakeTokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useStakeRIF } from '../hooks/useStakeRIF'

export const StepThree = ({ onGoToStep, onCloseModal, onBoostEligible }: StepProps) => {
  const {
    amount,
    tokenToSend,
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
  const isAbiBoostEnabled = useIsAbiBoostEnabled()
  // Read before the stake lands, so the outcome compares against the balance it started from
  const boostOutlook = useStakeBoostOutlook(amount)
  const becomesBoostEligible = isAbiBoostEnabled && boostOutlook?.kind === 'eligible' && !!onBoostEligible

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
              if (becomesBoostEligible && onBoostEligible) {
                onBoostEligible(amount)
                return
              }
              onCloseModal()
            },
            onError: (txHash, err) => {
              if (isUserRejectedTxError(err)) return
              posthog.capture('stake_rif_failed', {
                amount_decimal: Number(amount) || 0,
                token: tokenToSend.symbol,
                ...txFailureProps(err),
                tx_hash: txHash,
              })
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
    becomesBoostEligible,
    onBoostEligible,
    setButtonActions,
    refetchBalances,
    tokenToSend.symbol,
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

      <StakeBoostEligibilityRow amount={amount} />

      <TransactionStatus txHash={stakeTxHash} isTxFailed={isTxFailed} failureMessage="Stake TX failed." />
    </>
  )
}
