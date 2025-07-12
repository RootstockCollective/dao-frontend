'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { BaseProposalFields } from './components/BaseProposalFields'
import { BaseProposalSchema } from './components/baseProposalSchema'
import { useReviewProposal } from '../../context/ReviewProposalContext'

const ActivationProposalSchema = BaseProposalSchema.extend({
  targetContract: z.string().min(1, { message: 'Target contract is required' }),
})

export function ActivationProposalForm() {
  const router = useRouter()
  const { setSubfooter } = useLayoutContext()
  const { form: savedForm, setForm } = useReviewProposal()

  const { handleSubmit, control } = useForm<z.infer<typeof ActivationProposalSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(ActivationProposalSchema),
    defaultValues: savedForm || {
      proposalName: '',
      description: '',
      discourseLink: '',
      targetContract: '',
    },
  })

  const onSubmit = useCallback(
    () =>
      handleSubmit(data => {
        setForm(data)
        router.push('/proposals/new/review')
      })(),
    [handleSubmit, router, setForm],
  )

  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} />)
    return () => setSubfooter(null)
  }, [])

  return (
    <div>
      <form>
        <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
          <BaseProposalFields control={control} />
          <div className="flex flex-col gap-4">
            <h2 className="font-kk-topo text-text-100 text-2xl uppercase leading-loose tracking-wide">
              Activation Details
            </h2>
            {/* Здесь будут дополнительные поля для активации */}
          </div>
        </div>
      </form>
    </div>
  )
}
