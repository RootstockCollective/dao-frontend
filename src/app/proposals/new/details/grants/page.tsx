'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { TextInput, NumberInput } from '@/components/FormFields'
import { BaseProposalFields, TokenRadioGroup } from '../components'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReviewProposal } from '@/app/providers'
import { ProposalCategory } from '@/shared/types'
import { GrantProposal, GrantProposalSchema } from '../schemas/GrantProposalSchema'
import { Header } from '@/components/TypographyNew'

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
    <form>
      <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
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
            maxLength={42}
          />
          <div className="flex items-center justify-start gap-6">
            <div className="basis-1/2">
              <NumberInput
                name="transferAmount"
                control={control}
                label="Amount to be transferred"
                data-testid="InputAmount"
              />
            </div>
            <TokenRadioGroup name="token" control={control} />
          </div>
        </div>
      </div>
    </form>
  )
}
