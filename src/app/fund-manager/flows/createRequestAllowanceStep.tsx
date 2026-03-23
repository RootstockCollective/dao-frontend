'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Address } from 'viem'

import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span } from '@/components/Typography'
import { RBTC, WRBTC, WRBTC_ADDRESS } from '@/lib/constants'
import { formatNumberWithCommas } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'

import { useErc20Allowance } from '../hooks/useErc20Allowance'
import { FlowStepProps } from '../types'
import { AmountFlowContextValue } from './createAmountFlowContext'

interface CreateRequestAllowanceStepConfig {
  spenderAddress: Address
  contractLabel: string
  useFlowContext: () => AmountFlowContextValue
}

export const createRequestAllowanceStep = ({
  spenderAddress,
  contractLabel,
  useFlowContext,
}: CreateRequestAllowanceStepConfig) => {
  const RequestAllowanceStep = ({ onGoNext, onGoBack, setButtonActions }: FlowStepProps) => {
    const { amount, usdEquivalent, isValidAmount } = useFlowContext()
    const hasAutoAdvancedRef = useRef(false)

    const formattedAllowanceAmount = useMemo(() => (amount ? formatNumberWithCommas(amount) : '0'), [amount])

    const { isAllowanceEnough, isAllowanceReadLoading, onRequestAllowance, isRequesting, isTxPending } =
      useErc20Allowance(WRBTC_ADDRESS, spenderAddress, amount)

    useEffect(() => {
      if (isAllowanceEnough && !hasAutoAdvancedRef.current) {
        onGoNext()
        hasAutoAdvancedRef.current = true
      }
    }, [isAllowanceEnough, onGoNext])

    const handleRequestAllowance = useCallback(() => {
      executeTxFlow({
        onRequestTx: onRequestAllowance,
        onSuccess: onGoNext,
        action: 'allowance',
      })
    }, [onRequestAllowance, onGoNext])

    useEffect(() => {
      setButtonActions({
        primary: {
          label: isRequesting ? 'Requesting...' : 'Request allowance',
          onClick: handleRequestAllowance,
          disabled: isAllowanceReadLoading || !isValidAmount,
          loading: isRequesting,
          isTxPending,
        },
        secondary: {
          label: 'Back',
          onClick: onGoBack,
        },
      })
    }, [
      isAllowanceReadLoading,
      isRequesting,
      isTxPending,
      isValidAmount,
      onGoBack,
      handleRequestAllowance,
      setButtonActions,
    ])

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-10 mb-8">
        <div className="flex flex-col gap-2">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <Header variant="h1">{contractLabel}</Header>
        </div>
        <div className="flex flex-col gap-2 items-start">
          <Label variant="tag" className="text-bg-0">
            Allowance Amount
          </Label>
          <div className="flex flex-wrap items-center gap-2 min-h-10">
            <Header variant="h1" className="truncate min-w-0">
              {formattedAllowanceAmount}
            </Header>
            <div className="flex items-center gap-1 pl-2 py-2 rounded-sm shrink-0">
              <TokenImage symbol={RBTC} size={24} />
              <Span variant="body-l" bold>
                {WRBTC}
              </Span>
            </div>
          </div>
          {usdEquivalent && (
            <Label variant="body-s" className="text-text-60 w-full">
              {usdEquivalent}
            </Label>
          )}
        </div>
      </div>
    )
  }
  return RequestAllowanceStep
}
