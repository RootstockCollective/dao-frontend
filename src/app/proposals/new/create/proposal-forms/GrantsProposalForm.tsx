'use client'

import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { useEffect } from 'react'
import { Subfooter } from '../Subfooter'
import { TextInput, TextArea } from '@/components/FormFields'
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

export const ProposalSchema = z
  .object({
    proposalName: z
      .string()
      .trim()
      .min(5, { message: 'Name must be at least 5 characters' })
      .max(200, { message: 'Name must be at most 200 characters' }),

    discourseLink: z.string().url({ message: 'Must be a valid URL' }),

    description: z
      .string()
      .trim()
      .min(10, { message: 'Description must be at least 10 characters' })
      .max(3000, { message: 'Description must be at most 3000 characters' }),

    token: z.enum(['RBTC', 'RIF']),

    targetAddress: z
      .string()
      .refine(val => isAddress(val), { message: 'Invalid Ethereum address' })
      .refine(val => isChecksumValid(val), { message: 'Address checksum is invalid' }),

    transferAmount: z
      .string()
      .trim()
      .refine(val => !isNaN(Number(val)), {
        message: 'Amount must be a number',
      }),
  })
  .superRefine((data, ctx) => {
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
    setSubfooter(<Subfooter href="/dusya" />)
    return () => setSubfooter(null)
  }, [])

  const form = useForm<z.infer<typeof ProposalSchema>>({
    // mode: 'onSubmit',
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
    formState: { errors },
  } = form
  const watch = useWatch(form)
  return (
    <div>
      <form>
        <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
          <div className="flex flex-col gap-4">
            <TextInput
              {...register('proposalName', { required: true })}
              value={watch.proposalName}
              errorMsg={errors.proposalName?.message}
              label="Proposal name"
              data-testid="InputName"
              autoComplete="off"
            />
            <TextInput
              {...register('discourseLink')}
              value={watch.discourseLink}
              label="Discourse link"
              data-testid="InputLink"
              errorMsg={errors.discourseLink?.message}
            />
            <TextArea
              {...register('description')}
              value={watch.description}
              errorMsg={errors.description?.message}
              label="Short description"
              data-testid="InputDescription"
            />
          </div>
          <div className="flex flex-col gap-4">
            <h2 className="font-kk-topo text-text-100 text-2xl uppercase leading-loose tracking-wide">
              Proposal Action
            </h2>
            <TextInput
              {...register('targetAddress')}
              value={watch.targetAddress}
              errorMsg={errors.targetAddress?.message}
              label="Address to transfer funds to"
              data-testid="InputAddress"
            />
            <div className="flex items-center justify-start gap-6">
              <div className="basis-1/2">
                <TextInput
                  {...register('transferAmount')}
                  value={watch.transferAmount}
                  errorMsg={errors.transferAmount?.message}
                  label="Amount to be transferred"
                  data-testid="InputAmount"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
