'use client'

import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useEffect } from 'react'
import { Subfooter } from '../Subfooter'
import { BaseProposalFields } from './components/BaseProposalFields'
import { BaseProposalSchema } from './components/baseProposalSchema'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

const ActivationProposalSchema = BaseProposalSchema.extend({
  // Дополнительные поля для активации
  targetContract: z.string().min(1, { message: 'Target contract is required' }),
})

export function ActivationProposalForm() {
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(<Subfooter href="/" />)
    return () => setSubfooter(null)
  }, [])

  const form = useForm<z.infer<typeof ActivationProposalSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(ActivationProposalSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      discourseLink: '',
      targetContract: '',
    },
  })

  const {
    register,
    formState: { errors },
  } = form
  const watch = useWatch(form)

  return (
    <div>
      <form>
        <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
          <BaseProposalFields register={register} errors={errors} watch={watch} />
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
