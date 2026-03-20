'use client'

import { useEffect } from 'react'

import { CopyButton } from '@/components/CopyButton'
import { BiCopyIcon } from '@/components/Icons'
import { Header, Label } from '@/components/Typography'
import { rbtcVault } from '@/lib/contracts'
import { shortAddress } from '@/lib/utils'

import { AmountInputSection } from '../../../components/AmountInputSection'
import { TokenSelector } from '../../../components/TokenSelector'
import { FlowStepProps } from '../../../types'
import { useDepositToVaultContext } from '../DepositToVaultContext'

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
  } = useDepositToVaultContext()

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
          Vault address
        </Label>
        <CopyButton
          copyText={rbtcVault.address}
          className="w-fit justify-start gap-2"
          aria-label="Copy vault address"
          icon={<BiCopyIcon className="h-4 w-4 shrink-0 text-bg-0" />}
        >
          <Header variant="h3">{shortAddress(rbtcVault.address, 6)}</Header>
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
