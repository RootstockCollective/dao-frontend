import { useRemoveBuilderProposal } from '@/app/proposals/hooks/useRemoveBuilderProposal'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { useAlertContext } from '@/app/providers/AlertProvider'
import {
  Form,
  FormControl,
  FormField,
  FormInput,
  FormItem,
  FormLabel,
  FormMessage,
  FormTextarea,
} from '@/components/Form'
import { TX_MESSAGES } from '@/shared/txMessages'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Address, isAddress } from 'viem'
import { z } from 'zod'
import { CreateProposalHeaderSection } from './CreateProposalHeaderSection'

const FormSchema = z.object({
  proposalName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  builderAddress: z.string().refine(value => isAddress(value), 'Please enter a valid address'),
  description: z
    .string()
    .max(3000)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
})

export const RemoveBuilderProposalForm: FC = () => {
  const router = useRouter()
  const params = useSearchParams()
  const proposalId = params?.get('proposalId') ?? ''
  const { isLoading: isVotingPowerLoading, canCreateProposal } = useVotingPower()
  const { setMessage } = useAlertContext()
  const { onRemoveBuilderProposal, isPublishing, error } = useRemoveBuilderProposal()
  if (error) {
    setMessage(TX_MESSAGES.proposal.error)
    console.error('🐛 Error writing to contract:', error)
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: params?.get('proposalName') ?? ('' as string),
      builderAddress: (params?.get('builderAddress') ?? '') as Address,
      description: params?.get('description') ?? ('' as string),
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = form

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const { proposalName, description, builderAddress } = data
    const proposalDescription = `${proposalName};${description}`

    try {
      const txHash = await onRemoveBuilderProposal(builderAddress as Address, proposalDescription)
      router.push(`/proposals?txHash=${txHash}`)
    } catch (err: any) {
      if (err?.cause?.code !== 4001) {
        setMessage(TX_MESSAGES.proposal.error)
      }
    }
  }

  useEffect(() => {
    if (!isVotingPowerLoading && !canCreateProposal) {
      router.push(`/proposals/${proposalId}`)
    }
  }, [canCreateProposal, isVotingPowerLoading, proposalId, router])

  if (isVotingPowerLoading || !canCreateProposal) {
    return null
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CreateProposalHeaderSection disabled={!isDirty || !isValid || isPublishing} loading={isPublishing} />
        <FormField
          control={control}
          name="proposalName"
          render={({ field }) => (
            <FormItem className="mb-6 mx-1">
              <FormLabel>Proposal name</FormLabel>
              <FormControl>
                <FormInput placeholder="Name your proposal" {...field} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="builderAddress"
          render={({ field }) => (
            <FormItem className="mb-6 mx-1">
              <FormLabel>Builder address</FormLabel>
              <FormControl>
                <FormInput placeholder="Write or paste the builder address" {...field} maxLength={100} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-6 mx-1">
              <FormLabel>Description</FormLabel>
              <FormControl>
                <FormTextarea
                  placeholder="Enter the reason for de-whitelisting and any supporting evidence..."
                  {...field}
                  maxLength={3000}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
