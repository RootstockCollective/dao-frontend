'use client'

import { Loader } from 'lucide-react'
import { Control, useFormContext } from 'react-hook-form'

import { TextInput } from '@/components/FormFields'
import { useFormAddressResolution } from '@/shared/hooks'

import { type BTCAddWhitelistForm } from '../schema'

export function WhitelistAddressInput({
  control,
  disabled,
}: {
  control: Control<BTCAddWhitelistForm>
  disabled: boolean
}) {
  const { register } = useFormContext<BTCAddWhitelistForm>()
  const { isResolving, resolutionMsg } = useFormAddressResolution({
    rnsOrAddressFieldName: 'walletAddressInput',
    resolvedAddressFieldName: 'walletAddress',
    rnsFieldName: 'walletAddressRNS',
    errorFieldName: 'walletAddressError',
  })

  return (
    <div className="relative h-min">
      {isResolving && <Loader className="absolute top-5 right-4 z-base animate-spin" />}
      <TextInput
        name="walletAddressInput"
        control={control}
        label="RNS name or address"
        data-testid="WhitelistAddressInput"
        infoMessage={resolutionMsg}
        spellCheck={false}
        disabled={disabled}
      />
      <input type="hidden" {...register('walletAddress')} />
      <input type="hidden" {...register('walletAddressRNS')} />
      <input type="hidden" {...register('walletAddressError')} />
    </div>
  )
}
