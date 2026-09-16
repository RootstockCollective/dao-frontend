'use client'

import { useEffect } from 'react'
import { Address } from 'viem'

import { Button } from '@/components/Button'
import { CopyButton } from '@/components/CopyButton'
import { BiCopyIcon } from '@/components/Icons'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { shortAddress } from '@/lib/utils'

import { AmountInputSection } from '../components/AmountInputSection'
import { TokenSelector } from '../components/TokenSelector'
import { FlowStepProps } from '../types'
import { AmountFlowContextValue } from './createAmountFlowContext'

interface CreateDepositAmountStepConfig {
  contractAddress: Address
  addressLabel: string
  useFlowContext: () => AmountFlowContextValue
}

export const createDepositAmountStep = ({
  contractAddress,
  addressLabel,
  useFlowContext,
}: CreateDepositAmountStepConfig) => {
  const DepositAmountStep = ({ onGoNext, setButtonActions }: FlowStepProps) => {
    const {
      amount,
      isValidAmount,
      errorMessage,
      usdEquivalent,
      selectedToken,
      balanceFormatted,
      limitInfo,
      maxDepositableFormatted,
      depositLimitStatus,
      onRetryDepositLimit,
      handleAmountChange,
      handlePercentageClick,
      setSelectedToken,
    } = useFlowContext()

    useEffect(() => {
      setButtonActions({
        primary: {
          label: 'Continue',
          onClick: onGoNext,
          disabled: !isValidAmount,
        },
      })
    }, [isValidAmount, onGoNext, setButtonActions])

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-0.5">
          <Label variant="tag" className="text-bg-0">
            {addressLabel}
          </Label>
          <CopyButton
            copyText={contractAddress}
            className="w-fit justify-start gap-2"
            aria-label={`Copy ${addressLabel.toLowerCase()}`}
            icon={<BiCopyIcon className="h-4 w-4 shrink-0 text-bg-0" />}
          >
            <Header variant="h3">{shortAddress(contractAddress, 6)}</Header>
          </CopyButton>
        </div>

        <AmountInputSection
          title="Enter amount to transfer"
          amount={amount}
          onAmountChange={handleAmountChange}
          onPercentageClick={handlePercentageClick}
          balanceFormatted={balanceFormatted}
          tokenSymbol={selectedToken}
          maxDepositableFormatted={maxDepositableFormatted}
          usdEquivalent={usdEquivalent}
          errorMessage={errorMessage}
          tokenSelector={<TokenSelector selectedToken={selectedToken} onTokenChange={setSelectedToken} />}
        />

        {depositLimitStatus === 'loading' && (
          <div className="flex flex-col gap-0.5" data-testid="DepositLimitLoadingCard">
            <Label variant="tag" className="text-bg-0">
              Current reported off-chain
            </Label>
            <Span>Loading deposit limit…</Span>
          </div>
        )}

        {depositLimitStatus === 'error' && (
          <div className="flex flex-col gap-2" data-testid="DepositLimitErrorCard">
            <Label variant="tag" className="text-bg-0">
              Current reported off-chain
            </Label>
            <Span>Could not load the deposit limit.</Span>
            {onRetryDepositLimit && (
              <Button type="button" variant="secondary" onClick={() => void onRetryDepositLimit()}>
                Retry
              </Button>
            )}
          </div>
        )}

        {depositLimitStatus === 'ready' && limitInfo && (
          <div className="flex flex-col gap-0.5" data-testid="ReportedOffchainAssetsCard">
            <Label variant="tag" className="text-bg-0">
              Current reported off-chain
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Span>{limitInfo.amount}</Span>
              <div className="flex items-center gap-0.5 shrink-0 py-px rounded-sm">
                <TokenImage symbol={RBTC} size={16} />
                <Label variant="body-s" bold>
                  {RBTC}
                </Label>
              </div>
            </div>
            {limitInfo.fiatAmount && (
              <Label variant="tag-s" className="text-bg-0">
                {limitInfo.fiatAmount}
              </Label>
            )}
          </div>
        )}
      </div>
    )
  }
  return DepositAmountStep
}
