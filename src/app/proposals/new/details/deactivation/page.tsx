'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Address } from 'viem'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ProposalSubfooter } from '../../components/ProposalSubfooter'
import { BaseProposalFields } from '../components/BaseProposalFields'
import { useReviewProposal } from '@/app/providers'
import { ProposalCategory } from '@/shared/types'
import { TextInput } from '@/components/FormFields'
import { type DeactivationProposal, DeactivationProposalSchema } from '../schemas/DeactivationProposalSchema'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { Header } from '@/components/Typography'
import { BASE_PROPOSAL_LIMITS } from '../schemas/BaseProposalSchema'

export default function DeactivationProposalForm() {
  const router = useRouter()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const { record, setRecord } = useReviewProposal()
  const { getBuilderByAddress } = useBuilderContext()

  const updatedFormSchema = DeactivationProposalSchema.refine(
    ({ builderAddress }) => {
      const builder = getBuilderByAddress(builderAddress)
      return builder?.stateFlags?.communityApproved ?? false
    },
    {
      message: 'The address is not whitelisted',
      path: ['builderAddress'],
    },
  )

  const { handleSubmit, control, setFocus, formState } = useForm<DeactivationProposal>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver: zodResolver(updatedFormSchema),
    // use recorded proposal if it is of the same type
    defaultValues:
      record && record.category === ProposalCategory.Deactivation
        ? record.form
        : {
            proposalName: '',
            description: '',
            discourseLink: '',
            builderAddress: '' as Address,
          },
  })

  const onSubmit = useCallback(
    () =>
      handleSubmit(data => {
        setRecord({ form: data, category: ProposalCategory.Deactivation })
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
  useEffect(() => setFocus('proposalName'), [])

  return (
    <div className="mt-10 md:mt-12">
      <form>
        <div className="w-full max-w-[760px] p-4 md:px-6 md:pt-6 md:pb-8 flex flex-col gap-8 md:gap-10 bg-bg-80 rounded-sm">
          <BaseProposalFields control={control} />
          <div className="flex flex-col gap-6 md:gap-4">
            <Header caps variant="h2" className="leading-loose tracking-wide">
              Proposal Action
            </Header>
            <TextInput
              control={control}
              name="builderAddress"
              label="Builder address to de-whitelist"
              maxLength={BASE_PROPOSAL_LIMITS.address.max}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
