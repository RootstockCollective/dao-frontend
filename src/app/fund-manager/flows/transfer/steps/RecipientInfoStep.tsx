'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { TextInput } from '@/components/FormFields'

import { AmountInputSection } from '../../../components/AmountInputSection'
import { TokenSelector } from '../../../components/TokenSelector'
import { FlowStepProps } from '../../../types'
import { type RecipientInfoForm, recipientInfoFormSchema } from '../schemas/RecipientInfoSchema'
import { useTransferToManagerContext } from '../TransferToManagerContext'

export const RecipientInfoStep = ({ onGoNext, setButtonActions }: FlowStepProps) => {
  const {
    amount,
    isFormValid,
    errorMessage,
    usdEquivalent,
    selectedToken,
    balanceFormatted,
    handleAmountChange,
    handlePercentageClick,
    setSelectedToken,
    recipientAddress,
    setRecipientAddress,
  } = useTransferToManagerContext()

  const { control, watch } = useForm<RecipientInfoForm>({
    defaultValues: { recipientAddress },
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(recipientInfoFormSchema),
  })

  const watchedAddress = watch('recipientAddress')

  useEffect(() => {
    setRecipientAddress(watchedAddress)
  }, [watchedAddress, setRecipientAddress])

  useEffect(() => {
    setButtonActions({
      primary: {
        label: 'Continue',
        onClick: onGoNext,
        disabled: !isFormValid,
      },
    })
  }, [isFormValid, onGoNext, setButtonActions])

  return (
    <div className="flex flex-col gap-8">
      <TextInput
        name="recipientAddress"
        control={control}
        label="Enter recipient address 0x..."
        data-testid="RecipientAddressInput"
        spellCheck={false}
      />

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
