'use client'

import { Loader } from 'lucide-react'
import { TextInput } from '@/components/FormFields'
import { useFormAddressResolution } from '@/shared/hooks'
import { useFormContext } from 'react-hook-form'
import { BASE_PROPOSAL_LIMITS } from '../schemas/BaseProposalSchema'

/**
 * Input form field for either RNS domain or Rootstock address
 */
export function RnsAddressInput() {
  const { control, register } = useFormContext()
  const { isResolving, resolutionMsg } = useFormAddressResolution()
  return (
    <div className="relative h-min">
      {isResolving && <Loader className="absolute top-5 right-4 z-base animate-spin" />}
      <TextInput
        name="targetAddressInput"
        control={control}
        label="Address to transfer funds to"
        data-testid="InputAddress"
        maxLength={BASE_PROPOSAL_LIMITS.address.max}
        infoMessage={resolutionMsg}
        spellCheck={false}
        className="text-sm"
      />

      {/* Hidden form field with verified target Rootstock address resolved from RNS */}
      <input type="hidden" {...register('targetAddress')} />
      <input type="hidden" {...register('targetAddressRNS')} />
      <input type="hidden" {...register('targetAddressError')} />
    </div>
  )
}
