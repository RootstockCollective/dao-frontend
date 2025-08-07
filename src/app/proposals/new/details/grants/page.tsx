'use client'

import { useReviewProposal } from '@/app/providers'
import { NumberInput, TextInput } from '@/components/FormFields'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Header } from '@/components/TypographyNew'
import { ProposalCategory } from '@/shared/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { Subfooter } from '../../components/Subfooter'
import { BaseProposalFields, ProposalInfoSidebar, TokenRadioGroup } from '../components'
import { BASE_PROPOSAL_LIMITS } from '../schemas/BaseProposalSchema'
import { GrantProposal, GrantProposalSchema } from '../schemas/GrantProposalSchema'
import { TOKEN_FIELD_LIMITS } from '../schemas/TokenSchema'

export default function GrantsProposalForm() {
  const { record, setRecord } = useReviewProposal()
  const router = useRouter()

  const { handleSubmit, control, setFocus, formState } = useForm<GrantProposal>({
    mode: 'onTouched',
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
            token: 'RIF',
            transferAmount: '',
          },
  })
  const onSubmit = useCallback(
    () =>
      handleSubmit(data => {
        setRecord({ form: data, category: ProposalCategory.Grants })
        router.push('/proposals/new/review/grants')
      })(),
    // eslint-disable-next-line
    [handleSubmit, router],
  )

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(
      <Subfooter submitForm={onSubmit} buttonText="Review proposal" nextDisabled={!formState.isValid} />,
    )
    return () => setSubfooter(null)
  }, [formState.isValid, onSubmit, setSubfooter])

  // set focus on proposal name field
  // eslint-disable-next-line
  useEffect(() => setFocus('proposalName'), [])

  return (
    <div className="flex gap-6">
      <form className="w-2/3 px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
        <BaseProposalFields control={control} />
        <div className="flex flex-col gap-4">
          <Header caps variant="h2" className="leading-loose tracking-wide">
            Proposal Action
          </Header>
          <TextInput
            name="targetAddress"
            control={control}
            label="Address to transfer funds to"
            data-testid="InputAddress"
            maxLength={BASE_PROPOSAL_LIMITS.address.max}
          />
          <div className="flex items-center justify-start gap-6">
            <div className="basis-1/2">
              <NumberInput
                name="transferAmount"
                control={control}
                label="Amount to be transferred"
                data-testid="InputAmount"
                maxLength={TOKEN_FIELD_LIMITS.transferAmount.maxLength}
              />
            </div>
            <TokenRadioGroup name="token" control={control} />
          </div>
        </div>
      </form>
      <div className="w-1/3 flex flex-row gap-2 items-start">
        <ProposalInfoSidebar kycLink="https://gov.rootstockcollective.xyz/t/general-guidelines-for-grant-applications/94/7" />
      </div>
    </div>
  )
}
