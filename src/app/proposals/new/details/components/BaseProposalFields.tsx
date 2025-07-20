'use client'

import { TextInput, TextArea } from '@/components/FormFields'
import { FieldValues, Control, Path } from 'react-hook-form'
import { BaseProposalFormData, PROPOSAL_LIMITS } from '../schemas/BaseProposalSchema'

interface BaseProposalFieldsProps<T extends BaseProposalFormData & FieldValues> {
  control: Control<T>
}

export function BaseProposalFields<T extends BaseProposalFormData & FieldValues>({
  control,
}: BaseProposalFieldsProps<T>) {
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        name={'proposalName' as Path<T>}
        control={control}
        label="Proposal name"
        data-testid="InputName"
        autoComplete="off"
        maxLength={PROPOSAL_LIMITS.proposalName.max}
      />
      <TextInput
        name={'discourseLink' as Path<T>}
        control={control}
        label="Discourse link"
        data-testid="InputLink"
        maxLength={PROPOSAL_LIMITS.discourseLink.max}
      />
      <TextArea
        name={'description' as Path<T>}
        control={control}
        label="Short description"
        data-testid="InputDescription"
        maxLength={PROPOSAL_LIMITS.description.max}
      />
    </div>
  )
}
