'use client'

import { TextInput, MarkdownEditor } from '@/components/FormFields'
import type { FieldValues, Control, Path } from 'react-hook-form'
import { type BaseProposalFormData, BASE_PROPOSAL_LIMITS } from '../schemas/BaseProposalSchema'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface BaseProposalFieldsProps<T extends BaseProposalFormData & FieldValues> {
  control: Control<T>
}

export function BaseProposalFields<T extends BaseProposalFormData & FieldValues>({
  control,
}: BaseProposalFieldsProps<T>) {
  const isDesktop = useIsDesktop()
  return (
    <div className="flex flex-col gap-4">
      <TextInput
        name={'proposalName' as Path<T>}
        control={control}
        label="Proposal name"
        data-testid="InputName"
        autoComplete="off"
        maxLength={BASE_PROPOSAL_LIMITS.proposalName.max}
        spellCheck={false}
      />
      <TextInput
        name={'discourseLink' as Path<T>}
        control={control}
        label="Discourse link"
        data-testid="InputLink"
        maxLength={BASE_PROPOSAL_LIMITS.discourseLink.max}
        spellCheck={false}
      />
      <MarkdownEditor
        name={'description' as Path<T>}
        control={control}
        label="Short description"
        data-testid="InputDescription"
        maxLength={BASE_PROPOSAL_LIMITS.description.max}
        minHeight={isDesktop ? 200 : 120}
      />
    </div>
  )
}
