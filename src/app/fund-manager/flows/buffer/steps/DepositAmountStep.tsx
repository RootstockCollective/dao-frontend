'use client'

import { useEffect } from 'react'

import { CopyButton } from '@/components/CopyButton'
import { BiCopyIcon } from '@/components/Icons'
import { Header, Label } from '@/components/Typography'
import { buffer } from '@/lib/contracts'
import { shortAddress } from '@/lib/utils'

import { AmountInputSection } from '../../../components/AmountInputSection'
import { TokenSelector } from '../../../components/TokenSelector'
import { FlowStepProps } from '../../../types'
import { useTopUpBufferContext } from '../TopUpBufferContext'

export const DepositAmountStep = ({ onGoNext, setButtonActions }: FlowStepProps) => {
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
  } = useTopUpBufferContext()

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
          Buffer address
        </Label>
        <CopyButton
          copyText={buffer.address}
          className="w-fit justify-start gap-2"
          aria-label="Copy buffer address"
          icon={<BiCopyIcon className="h-4 w-4 shrink-0 text-bg-0" />}
        >
          <Header variant="h3">{shortAddress(buffer.address, 6)}</Header>
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
