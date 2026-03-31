'use client'

import { useEffect } from 'react'
import { Address } from 'viem'

import { AmountInputSection } from '@/app/fund-manager/components/AmountInputSection'
import { TokenSelector } from '@/app/fund-manager/components/TokenSelector'
import { FlowStepProps } from '@/app/fund-manager/types'
import { CopyButton } from '@/components/CopyButton'
import { BiCopyIcon } from '@/components/Icons'
import { Header, Label } from '@/components/Typography'
import { shortAddress } from '@/lib/utils'

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
          usdEquivalent={usdEquivalent}
          errorMessage={errorMessage}
          tokenSelector={<TokenSelector selectedToken={selectedToken} onTokenChange={setSelectedToken} />}
        />
      </div>
    )
  }
  return DepositAmountStep
}
