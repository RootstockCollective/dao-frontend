import { CreateProposalHeaderSection } from '@/app/proposals/create/CreateProposalHeaderSection'
import { useCreateBuilderWhitelistProposal } from '@/app/proposals/hooks/useCreateBuilderWhitelistProposal'
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
import { useRouter } from 'next/navigation'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Address, isAddress } from 'viem'
import { z } from 'zod'
import { useVotingPowerRedirect } from '../hooks/useVotingPowerRedirect'

const FormSchema = z.object({
  proposalName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  builderAddress: z.string().refine(value => isAddress(value), 'Please enter a valid address'),
  receiverAddress: z
    .string()
    .refine(value => isAddress(value) || value === '', 'Please enter a valid address'),
  description: z
    .string()
    .max(3000)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
})

export const CreateBuilderProposalForm: FC = () => {
  const router = useRouter()
  useVotingPowerRedirect()
  const { setMessage } = useAlertContext()
  const { onCreateBuilderWhitelistProposal, isPublishing, error } = useCreateBuilderWhitelistProposal()
  if (error) {
    setMessage(TX_MESSAGES.proposal.error)
    console.error('🐛 Error writing to contract:', error)
  }

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: '',
      builderAddress: '' as Address,
      receiverAddress: '',
      description: '',
    },
  })

  const {
    control,
    handleSubmit,
    formState: { isValid, isDirty },
  } = form

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const { proposalName, description, builderAddress, receiverAddress } = data
    const proposalDescription = `${proposalName};${description}`

    try {
      const txHash = await onCreateBuilderWhitelistProposal(
        builderAddress as Address,
        (receiverAddress || builderAddress) as Address,
        proposalDescription,
      )
      router.push(`/proposals?txHash=${txHash}`)
    } catch (err: any) {
      if (err?.cause?.code !== 4001) {
        setMessage(TX_MESSAGES.proposal.error)
      }
    }
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
          name="receiverAddress"
          render={({ field }) => (
            <FormItem className="mb-6 mx-1">
              <FormLabel>Receiver address (optional)</FormLabel>
              <FormControl>
                <FormInput placeholder="Write or paste the receiver address" {...field} maxLength={100} />
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
                <FormTextarea placeholder="Enter a description..." {...field} maxLength={3000} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
