'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Address, isAddress } from 'viem'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { BaseProposalFields } from './components/BaseProposalFields'
import { BaseProposalSchema } from './components/baseProposalSchema'
import { useReviewProposal } from '../../context/ReviewProposalContext'
import { TextInput } from '@/components/FormFields'
import { showFormErrors } from './components/showFormErrors'

export const ActivationProposalSchema = BaseProposalSchema.extend({
  builderAddress: z.string().refine(val => isAddress(val), { message: 'Invalid builder address' }),
})
export type BuilderProposal = z.infer<typeof ActivationProposalSchema>

export function ActivationProposalForm() {
  const router = useRouter()
  const { setSubfooter } = useLayoutContext()
  const { form: savedForm, setForm } = useReviewProposal()

  const { handleSubmit, control } = useForm<BuilderProposal>({
    mode: 'onTouched',
    resolver: zodResolver(ActivationProposalSchema),
    // use recorded proposal if it is of the same type
    defaultValues: (() => {
      const parsed = ActivationProposalSchema.safeParse(savedForm)
      return parsed.success
        ? parsed.data
        : {
            proposalName: '',
            description: '',
            discourseLink: '',
            builderAddress: '' as Address,
          }
    })(),
  })

  const onSubmit = useCallback(
    () =>
      handleSubmit(data => {
        setForm(data)
        router.push('/proposals/new/review')
      }, showFormErrors)(),
    [handleSubmit, router, setForm],
  )

  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Review proposal" />)
    return () => setSubfooter(null)
  }, [])

  return (
    <div>
      <form>
        <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
          <BaseProposalFields control={control} />
          <div className="flex flex-col gap-4">
            <h2 className="font-kk-topo text-text-100 text-2xl uppercase leading-loose tracking-wide">
              Proposal Action
            </h2>
            <TextInput control={control} name="builderAddress" label="Builder address to whitelist" />
          </div>
        </div>
      </form>
    </div>
  )
}
