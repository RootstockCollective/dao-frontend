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
import { useReviewProposal } from '../../context/ReviewProposalContext'
import { ProposalCategory } from '@/shared/types'
import { showFormErrors } from '../components/showFormErrors'
import { GrantProposal, GrantProposalSchema } from '../schemas/GrantProposalSchema'

//'/proposals/new/create?contract=DAOTreasuryAbi&action=withdraw'

export default function GrantsProposalForm() {
  const { record, setRecord } = useReviewProposal()
  const router = useRouter()

  const { handleSubmit, watch, control } = useForm<GrantProposal>({
    mode: 'onTouched',
    resolver: zodResolver(GrantProposalSchema),
    defaultValues:
      record && record.category === ProposalCategory.Grants
        ? record.form
        : {
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
          setRecord({ form: data, category: ProposalCategory.Grants })
          router.push('/proposals/new/review/grants')
        },
        // Error callback
        showFormErrors,
      )(),
    [handleSubmit, router],
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
                prefix={watch().token ? `${watch().token} ` : undefined}
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
