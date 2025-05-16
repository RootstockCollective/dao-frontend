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
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Address, getAddress } from 'viem'
import { z } from 'zod'
import { CreateProposalHeaderSection, ProposalType } from '@/app/proposals/create/CreateProposalHeaderSection'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/Accordion'
import { Header, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { isAddressRegex } from '@/app/proposals/shared/utils'
import { isBaseError, isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { useBuilderContext } from '../../collective-rewards/user'

const FormSchema = z.object({
  proposalName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  description: z
    .string()
    .max(3000)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
  builderAddress: z
    .string()
    .refine(value => isAddressRegex(value), 'Write or paste the address to be banned'),
})

export const RemoveBuilderProposalForm: FC = () => {
  const router = useRouter()
  const params = useSearchParams()
  const proposalId = params?.get('proposalId') ?? ''
  const { isLoading: isVotingPowerLoading, canCreateProposal } = useVotingPower()
  const { setMessage } = useAlertContext()
  const { onRemoveBuilderProposal, isPublishing } = useRemoveBuilderProposal()
  const { getBuilderByAddress } = useBuilderContext()

  const [activeStep, setActiveStep] = useState('proposal')

  const updatedFormSchema = FormSchema.refine(
    ({ builderAddress }) => {
      if (!isAddressRegex(builderAddress)) return false
      const builder = getBuilderByAddress(getAddress(builderAddress))
      return builder?.stateFlags?.communityApproved ?? false
    },
    {
      message: 'The address is not whitelisted',
      path: ['builderAddress'],
    },
  )

  const form = useForm<z.infer<typeof updatedFormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(updatedFormSchema),
    defaultValues: {
      proposalName: params?.get('proposalName') ?? ('' as string),
      builderAddress: (params?.get('builderAddress') ?? '') as Address,
      description: params?.get('description') ?? ('' as string),
    },
  })

  const {
    control,
    handleSubmit,
    formState: { touchedFields, errors, isValid, isDirty },
  } = form

  const isProposalNameValid = !errors.proposalName && touchedFields.proposalName
  const isDescriptionValid = !errors.description && touchedFields.description
  const isProposalCompleted = isProposalNameValid && isDescriptionValid
  const isBuilderAddressValid = !errors.builderAddress && touchedFields.builderAddress
  const isActionsCompleted = isBuilderAddressValid

  const handleProposalCompleted = () => setActiveStep('actions')

  const onSubmit = async (data: z.infer<typeof updatedFormSchema>) => {
    const { proposalName, description, builderAddress } = data
    const proposalDescription = `${proposalName};${description}`

    try {
      const txHash = await onRemoveBuilderProposal(builderAddress as Address, proposalDescription)
      router.push(`/proposals?txHash=${txHash}`)
    } catch (error: any) {
      if (isUserRejectedTxError(error)) return
      if (isBaseError(error)) {
        setMessage({ ...TX_MESSAGES.proposal.error, content: error.message })
      } else {
        setMessage(TX_MESSAGES.proposal.error)
        console.error('🐛 Error writing to contract:', error)
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
        <CreateProposalHeaderSection
          proposalType={ProposalType.BUILDER_DEACTIVATION}
          disabled={!isDirty || !isValid || isPublishing}
          loading={isPublishing}
        />
        <Accordion
          type="single"
          collapsible
          value={activeStep}
          onValueChange={setActiveStep}
          className="pl-4 container"
        >
          <AccordionItem value="proposal">
            <AccordionTrigger>
              <div className="flex justify-between align-middle w-full">
                <Header variant="h1" className="text-[24px] font-[400]" fontFamily="kk-topo">
                  PROPOSAL
                </Header>
                {isProposalCompleted && (
                  <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={control}
                name="proposalName"
                render={({ field }) => (
                  <FormItem className="mb-6 mx-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <FormInput placeholder="Name your proposal" {...field} maxLength={100} />
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
                        placeholder="Enter the reason for the ban and any supporting evidence..."
                        {...field}
                        maxLength={3000}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center mb-6">
                <Button disabled={!isProposalCompleted} onClick={handleProposalCompleted}>
                  Continue
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="actions" className="border-0">
            <AccordionTrigger>
              <div className="flex justify-between align-middle w-full">
                <Header variant="h1" className="text-[24px] font-[400]" fontFamily="kk-topo">
                  ACTIONS
                </Header>
                {isActionsCompleted && (
                  <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <FormField
                control={control}
                name="builderAddress"
                render={({ field }) => (
                  <FormItem className="mb-6 mx-1">
                    <FormLabel>Address to be de-whitelisted</FormLabel>
                    <FormControl>
                      <FormInput placeholder="0x..." {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </form>
    </Form>
  )
}
