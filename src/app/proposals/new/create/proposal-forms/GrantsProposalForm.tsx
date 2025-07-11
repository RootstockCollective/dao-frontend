'use client'

import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useEffect } from 'react'
import { Subfooter } from '../Subfooter'
import { TextInput, NumberInput } from '@/components/FormFields'
import { BaseProposalFields } from './components/BaseProposalFields'
import { BaseProposalSchema } from './components/baseProposalSchema'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Address, isAddress } from 'viem'

import { isChecksumValid } from '@/app/proposals/shared/utils'

const MIN_AMOUNT = {
  RBTC: 0.0001,
  RIF: 1,
}

const MAX_AMOUNT = {
  RBTC: 21,
  RIF: 1_000_000,
}

export const ProposalSchema = BaseProposalSchema.extend({
  token: z.enum(['RBTC', 'RIF']),

  targetAddress: z
    .string()
    .refine(val => isAddress(val), { message: 'Invalid Rootstock address' })
    .refine(val => isChecksumValid(val), { message: 'Address checksum is invalid' }),

  transferAmount: z
    .string()
    .trim()
    .refine(val => !isNaN(Number(val)), {
      message: 'Amount must be a number',
    }),
}).superRefine((data, ctx) => {
  const num = Number(data.transferAmount)
  const token = data.token

  if (token in MIN_AMOUNT && num < MIN_AMOUNT[token]) {
    ctx.addIssue({
      path: ['transferAmount'],
      message: `Amount is below minimum for ${token}`,
      code: z.ZodIssueCode.custom,
    })
  }

  if (token in MAX_AMOUNT && num > MAX_AMOUNT[token]) {
    ctx.addIssue({
      path: ['transferAmount'],
      message: `Amount is above maximum for ${token}`,
      code: z.ZodIssueCode.custom,
    })
  }
})

export function GrantsProposalForm() {
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(<Subfooter href="/" />)
    return () => setSubfooter(null)
  }, [])

  const form = useForm<z.infer<typeof ProposalSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(ProposalSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      discourseLink: '',
      targetAddress: '' as Address,
      token: 'RBTC',
      transferAmount: '',
    },
  })
  const {
    register,
    setValue,
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
              Proposal Action
            </h2>
            <TextInput
              {...register('targetAddress', { required: true })}
              value={watch.targetAddress}
              errorMsg={errors.targetAddress?.message}
              label="Address to transfer funds to"
              data-testid="InputAddress"
            />
            <div className="flex items-center justify-start gap-6">
              <div className="basis-1/2">
                <NumberInput
                  {...register('transferAmount', { required: true })}
                  value={watch.transferAmount}
                  errorMsg={errors.transferAmount?.message}
                  label="Amount to be transferred"
                  data-testid="InputAmount"
                  onValueChange={({ value }) => setValue('transferAmount', value)}
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
