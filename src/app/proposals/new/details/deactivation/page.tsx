'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { type Address } from 'viem'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { BaseProposalFields } from '../components/BaseProposalFields'
import { useReviewProposal } from '@/app/providers'
import { ProposalCategory } from '@/shared/types'
import { TextInput } from '@/components/FormFields'
import { showFormErrors } from '../components/showFormErrors'
import { DeactivationProposal, DeactivationProposalSchema } from '../schemas/DeactivationProposalSchema'
import { useBuilderContext } from '@/app/collective-rewards/user'
import { Header } from '@/components/TypographyNew'

export default function DeactivationProposalForm() {
  const router = useRouter()
  const { setSubfooter } = useLayoutContext()
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

  const { handleSubmit, control, setFocus } = useForm<DeactivationProposal>({
    mode: 'onTouched',
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
        router.push('/proposals/new/review/deactivation')
      }, showFormErrors)(),
    // eslint-disable-next-line
    [handleSubmit, router],
  )

  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Review proposal" />)
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter])

  // eslint-disable-next-line
  useEffect(() => setFocus('proposalName'), [])

  return (
    <div>
      <form>
        <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
          <BaseProposalFields control={control} />
          <div className="flex flex-col gap-4">
            <Header caps variant="h2" className="leading-loose tracking-wide">
              Proposal Action
            </Header>
            <TextInput control={control} name="builderAddress" label="Builder address to de-whitelist" />
          </div>
        </div>
      </form>
    </div>
  )
}
