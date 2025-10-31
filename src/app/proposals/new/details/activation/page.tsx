'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Address } from 'viem'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ProposalSubfooter } from '../../components/ProposalSubfooter'
import { BaseProposalFields, ProposalInfoSidebar } from '../components'
import { useReviewProposal } from '@/app/providers'
import { ProposalCategory } from '@/shared/types'
import { TextInput } from '@/components/FormFields'
import {
  ACTIVATION_PROPOSAL_LIMITS,
  type ActivationProposal,
  ActivationProposalSchema,
} from '../schemas/ActivationProposalSchema'
import { BASE_PROPOSAL_LIMITS } from '../schemas/BaseProposalSchema'
import { Header } from '@/components/Typography'

export default function ActivationProposalForm() {
  const router = useRouter()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const { record, setRecord } = useReviewProposal()

  const { handleSubmit, control, setFocus, formState } = useForm<ActivationProposal>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(ActivationProposalSchema),
    // use recorded proposal if it is of the same type
    defaultValues:
      record && record.category === ProposalCategory.Activation
        ? record.form
        : {
            builderName: '',
            proposalName: '',
            description: '',
            discourseLink: '',
            builderAddress: '' as Address,
          },
  })

  const onSubmit = useCallback(
    () =>
      handleSubmit(data => {
        setRecord({ form: data, category: ProposalCategory.Activation })
        router.push('/proposals/new/review')
      })(),
    // eslint-disable-next-line
    [handleSubmit, router],
  )

  useEffect(() => {
    openDrawer(
      <ProposalSubfooter
        submitForm={onSubmit}
        buttonText="Review proposal"
        nextDisabled={!formState.isValid}
      />,
    )
    return () => closeDrawer()
  }, [formState.isValid, onSubmit, openDrawer, closeDrawer])

  // eslint-disable-next-line
  useEffect(() => setFocus('builderName'), [])

  return (
    <div className="mt-10 md:mt-12 flex flex-col md:flex-row gap-8 md:gap-6">
      <form className="basis-2/3 p-4 md:px-6 md:pt-6 md:pb-8 flex flex-col gap-8 md:gap-10 bg-bg-80 rounded-sm">
        <div className="flex flex-col gap-4">
          <TextInput
            name="builderName"
            control={control}
            label="Builder name"
            data-testid="BuilderName"
            autoComplete="off"
            maxLength={ACTIVATION_PROPOSAL_LIMITS.builderName.max}
            spellCheck={false}
          />
          <BaseProposalFields control={control} />
        </div>
        <div className="flex flex-col gap-6 md:gap-4">
          <Header caps variant="h2" className="leading-loose tracking-wide" data-testid="ProposalActionLabel">
            Proposal Action
          </Header>
          <TextInput
            control={control}
            name="builderAddress"
            label="Builder address to whitelist"
            maxLength={BASE_PROPOSAL_LIMITS.address.max}
            data-testid="BuilderAddress"
          />
        </div>
      </form>
      <div className="basis-1/3 flex flex-row gap-2 items-start">
        <ProposalInfoSidebar kycLink="https://gov.rootstockcollective.xyz/t/general-guidelines-for-rewards-applications/495/2" />
      </div>
    </div>
  )
}
