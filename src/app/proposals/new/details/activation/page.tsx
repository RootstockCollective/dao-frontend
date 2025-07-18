'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Address } from 'viem'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { BaseProposalFields } from '../components/BaseProposalFields'
import { useReviewProposal } from '@/app/providers'
import { ProposalCategory } from '@/shared/types'
import { TextInput } from '@/components/FormFields'
import { showFormErrors } from '../components/showFormErrors'
import { ActivationProposal, ActivationProposalSchema } from '../schemas/ActivationProposalSchema'
import { Header } from '@/components/TypographyNew'

export default function ActivationProposalForm() {
  const router = useRouter()
  const { setSubfooter } = useLayoutContext()
  const { record, setRecord } = useReviewProposal()

  const { handleSubmit, control, setFocus } = useForm<ActivationProposal>({
    mode: 'onTouched',
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
        router.push('/proposals/new/review/activation')
      }, showFormErrors)(),
    // eslint-disable-next-line
    [handleSubmit, router],
  )

  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Review proposal" />)
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter])

  // eslint-disable-next-line
  useEffect(() => setFocus('builderName'), [])

  return (
    <div>
      <form>
        <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
          <div className="flex flex-col gap-4">
            <TextInput
              name="builderName"
              control={control}
              label="Builder name"
              data-testid="BuilderName"
              autoComplete="off"
            />
            <BaseProposalFields control={control} />
          </div>
          <div className="flex flex-col gap-4">
            <Header caps variant="h2" className="leading-loose tracking-wide">
              Proposal Action
            </Header>
            <TextInput control={control} name="builderAddress" label="Builder address to whitelist" />
          </div>
        </div>
      </form>
    </div>
  )
}
