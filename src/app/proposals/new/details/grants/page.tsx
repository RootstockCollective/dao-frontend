'use client'

import { useReviewProposal } from '@/app/providers'
import { NumberInput, SelectField } from '@/components/FormFields'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Header } from '@/components/Typography'
import { ProposalCategory } from '@/shared/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import type { Address } from 'viem'
import { ProposalSubfooter } from '../../components/ProposalSubfooter'
import { BaseProposalFields, ProposalInfoSidebar, TokenRadioGroup } from '../components'
import { type GrantProposal, GrantProposalSchema } from '../schemas/GrantProposalSchema'
import { TOKEN_FIELD_LIMITS } from '../schemas/TokenSchema'
import { labeledMilestones } from '@/app/proposals/shared/utils'
import { MilestoneInfoSidebar } from '../components/MilestoneInfoSidebar'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { RnsAddressInput } from './RnsAddressInput'

export default function ProposalReview() {
  const isDesktop = useIsDesktop()
  const { record, setRecord } = useReviewProposal()
  const router = useRouter()

  const form = useForm<GrantProposal>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(GrantProposalSchema),
    defaultValues:
      record && record.category === ProposalCategory.Grants
        ? record.form
        : {
            proposalName: '',
            description: '',
            discourseLink: '',
            targetAddress: '' as Address,
            token: 'USDRIF',
            transferAmount: '',
            milestone: undefined,
          },
  })
  const { handleSubmit, control, setFocus, formState } = form

  const onSubmit = useCallback(
    () =>
      handleSubmit(data => {
        setRecord({ form: data, category: ProposalCategory.Grants })
        router.push('/proposals/new/review')
      })(),
    [handleSubmit, router, setRecord],
  )

  // inject sticky drawer with submit button to the footer layout
  const { openDrawer, closeDrawer } = useLayoutContext()
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

  // set focus on proposal name field
  // eslint-disable-next-line
  useEffect(() => setFocus('proposalName'), [])

  return (
    <div className="flex flex-col lg:flex-row gap-6 mt-10">
      <FormProvider {...form}>
        <form className="p-6 pb-8 flex flex-col gap-6 md:gap-10 basis-3/4 bg-bg-80 rounded-sm">
          <BaseProposalFields control={control} />
          <div className="flex flex-col gap-4">
            <Header caps variant="h2" className="leading-loose tracking-wide">
              Milestone Selection
            </Header>
            {!isDesktop && <MilestoneInfoSidebar />}
            <SelectField
              name="milestone"
              control={control}
              options={labeledMilestones}
              placeholder="Proposal milestone"
              className="max-w-[336px]"
              data-testid="MilestoneSelect"
            />
          </div>
          <div className="flex flex-col gap-4">
            <Header caps variant="h2" className="leading-loose tracking-wide">
              Proposal Action
            </Header>

            <RnsAddressInput />

            <div className="flex flex-col md:flex-row items-center justify-start gap-6 @container">
              <div className="w-full md:basis-1/2">
                <NumberInput
                  name="transferAmount"
                  control={control}
                  label="Amount to be transferred"
                  data-testid="InputAmount"
                  maxLength={TOKEN_FIELD_LIMITS.transferAmount.maxLength}
                />
              </div>
              <div className="w-full md:basis-1/2">
                <TokenRadioGroup name="token" control={control} />
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
      <div className="flex flex-col gap-10 basis-1/4 justify-between">
        <ProposalInfoSidebar kycLink="https://gov.rootstockcollective.xyz/t/general-guidelines-for-grant-applications/94/7" />
        {isDesktop && (
          <div className="mb-40">
            <MilestoneInfoSidebar />
          </div>
        )}
      </div>
    </div>
  )
}
