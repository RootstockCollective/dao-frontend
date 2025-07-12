'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Address, isAddress } from 'viem'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Subfooter } from '../../components/Subfooter'
import { TextInput, NumberInput } from '@/components/FormFields'
import { BaseProposalSchema, BaseProposalFields, TokenFieldsSchema, TokenRadioGroup } from './components'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReviewProposal } from '../../context/ReviewProposalContext'
import { ENV } from '@/lib/constants'
import { showFormErrors } from './components/showFormErrors'

// grant limits
const MIN_AMOUNT = {
  mainnet: {
    rBTC: 0.0001,
    RIF: 10,
  },
  testnet: {
    rBTC: 0.000001,
    RIF: 1,
  },
}

const MAX_AMOUNT = {
  mainnet: {
    rBTC: 21,
    RIF: 1_000_000,
  },
  testnet: {
    rBTC: 21,
    RIF: 1_000_000,
  },
}

// Grant proposal form schema
export const ProposalSchema = BaseProposalSchema.merge(TokenFieldsSchema)
  .extend({
    targetAddress: z.string().refine(val => isAddress(val), { message: 'Invalid Rootstock address' }),
  })
  .superRefine((data, ctx) => {
    const num = Number(data.transferAmount)
    const token = data.token
    const minAmount = MIN_AMOUNT[ENV]
    const maxAmount = MAX_AMOUNT[ENV]

    if (token in minAmount && num < minAmount[token]) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is below minimum for ${token} (${minAmount[token]})`,
        code: z.ZodIssueCode.custom,
      })
    }

    if (token in maxAmount && num > maxAmount[token]) {
      ctx.addIssue({
        path: ['transferAmount'],
        message: `Grant amount is above maximum for ${token} (${maxAmount[token]})`,
        code: z.ZodIssueCode.custom,
      })
    }
  })

export function GrantsProposalForm() {
  const { form: savedForm, setForm } = useReviewProposal()
  const router = useRouter()

  const { handleSubmit, watch, control } = useForm<z.infer<typeof ProposalSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(ProposalSchema),
    defaultValues: savedForm || {
      proposalName: '',
      description: '',
      discourseLink: '',
      targetAddress: '' as Address,
      token: 'rBTC',
      transferAmount: '',
    },
  })

  const onSubmit = useCallback(
    () =>
      handleSubmit(
        // Success callback
        data => {
          setForm(data)
          router.push('/proposals/new/review')
        },
        // Error callback
        showFormErrors,
      )(),
    [handleSubmit, router, setForm],
  )

  // inject sticky drawer with submit button to the footer layout
  const { setSubfooter } = useLayoutContext()
  useEffect(() => {
    setSubfooter(<Subfooter submitForm={onSubmit} buttonText="Review proposal" />)
    return () => setSubfooter(null)
  }, [onSubmit, setSubfooter])

  return (
    <form>
      <div className="w-full max-w-[760px] px-6 pt-6 pb-8 flex flex-col gap-10 bg-bg-80 rounded-sm">
        <BaseProposalFields control={control} />
        <div className="flex flex-col gap-4">
          <h2 className="font-kk-topo text-text-100 text-2xl uppercase leading-loose tracking-wide">
            Proposal Action
          </h2>
          <TextInput
            name="targetAddress"
            control={control}
            label="Address to transfer funds to"
            data-testid="InputAddress"
          />
          <div className="flex items-center justify-start gap-6">
            <div className="basis-1/2">
              <NumberInput
                name="transferAmount"
                control={control}
                prefix={`${watch().token} `}
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
