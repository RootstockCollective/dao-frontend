import posthog from 'posthog-js'
import { useCallback, useEffect, useRef } from 'react'

import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { Header, Label } from '@/components/Typography'
import Big from '@/lib/big'
import { executeTxFlow } from '@/shared/notification'

import { StakeTokenAmountDisplay } from '../components/StakeTokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useAllowance } from '../hooks/useAllowance'

export const StepTwo = ({ onGoNext, onGoBack }: StepProps) => {
  const {
    amount,
    tokenToSend,
    tokenToReceive,
    stakePreviewFrom: from,
    setButtonActions,
  } = useStakingContext()
  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceTxHash,
  } = useAllowance(amount, tokenToSend.contract, tokenToReceive.contract)

  const hasCalledOnGoNextRef = useRef(false)

  useEffect(() => {
    if (isAllowanceEnough && !hasCalledOnGoNextRef.current) {
      onGoNext()
      // prevent calling onGoNext multiple times.
      hasCalledOnGoNextRef.current = true
    }
  }, [isAllowanceEnough, onGoNext])

  const handleRequestAllowance = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestAllowance,
      onSuccess: txHash => {
        posthog.capture('stake_allowance_approved', {
          amount,
          amount_decimal: Number(amount) || 0,
          token: tokenToSend.symbol,
          token_price_usd: Number(tokenToSend.price) || 0,
          usd_value:
            Number(
              Big(amount || 0)
                .mul(tokenToSend.price || 0)
                .toString(),
            ) || 0,
          tx_hash: txHash,
        })
        onGoNext()
      },
      onError: (txHash, err) => {
        posthog.capture('stake_allowance_failed', {
          amount,
          amount_decimal: Number(amount) || 0,
          token: tokenToSend.symbol,
          token_price_usd: Number(tokenToSend.price) || 0,
          usd_value:
            Number(
              Big(amount || 0)
                .mul(tokenToSend.price || 0)
                .toString(),
            ) || 0,
          failure_reason: err.name === 'Rejected TX' ? 'user_rejected' : 'tx_failed',
          error_message: err.message,
          tx_hash: txHash,
        })
      },
      action: 'allowance',
    })
  }, [onRequestAllowance, onGoNext, amount, tokenToSend.symbol, tokenToSend.price])

  // Set button actions directly
  useEffect(() => {
    setButtonActions({
      primary: {
        label: isRequesting ? 'Requesting...' : 'Request allowance',
        onClick: handleRequestAllowance,
        disabled: isAllowanceReadLoading || !amount || Number(amount) <= 0,
        loading: isRequesting,
        isTxPending: isTxPending,
      },
      secondary: {
        label: 'Back',
        onClick: onGoBack,
        disabled: isAllowanceReadLoading,
        loading: false,
      },
    })
  }, [
    isAllowanceReadLoading,
    isRequesting,
    isTxPending,
    amount,
    onGoBack,
    handleRequestAllowance,
    setButtonActions,
  ])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">{tokenToSend.symbol} smart contract</Header>
          </div>
        </div>
        <StakeTokenAmountDisplay
          label="Allowance amount"
          amount={amount}
          tokenSymbol={tokenToSend.symbol}
          amountInCurrency={from.amountConvertedToCurrency}
          isFlexEnd
        />
      </div>

      <TransactionStatus
        txHash={allowanceTxHash}
        isTxFailed={isTxFailed}
        failureMessage="Allowance TX failed."
      />
    </>
  )
}
