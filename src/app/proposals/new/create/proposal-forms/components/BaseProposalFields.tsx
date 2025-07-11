'use client'

import { TextInput, TextArea } from '@/components/FormFields'
import { UseFormRegister, FieldErrors, FieldValues, Path } from 'react-hook-form'
import { BaseProposalFormData } from './baseProposalSchema'

type BaseProposalFields = 'proposalName' | 'discourseLink' | 'description'

interface BaseProposalFieldsProps<T extends BaseProposalFormData & FieldValues> {
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  watch: Partial<BaseProposalFormData>
}

export function BaseProposalFields<T extends BaseProposalFormData & FieldValues>({
  register,
  errors,
  watch,
}: BaseProposalFieldsProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        {...register('proposalName' as Path<T>)}
        value={watch.proposalName || ''}
        errorMsg={typeof errors.proposalName?.message === 'string' ? errors.proposalName.message : undefined}
        label="Proposal name"
        data-testid="InputName"
        autoComplete="off"
      />
      <TextInput
        {...register('discourseLink' as Path<T>)}
        value={watch.discourseLink || ''}
        label="Discourse link"
        data-testid="InputLink"
        errorMsg={
          typeof errors.discourseLink?.message === 'string' ? errors.discourseLink.message : undefined
        }
      />
      <TextArea
        {...register('description' as Path<T>)}
        value={watch.description || ''}
        errorMsg={typeof errors.description?.message === 'string' ? errors.description.message : undefined}
        label="Short description"
        data-testid="InputDescription"
      />
    </div>
  )
}
