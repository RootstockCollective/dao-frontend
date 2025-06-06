import { CreateProposalHeaderSection, ProposalType } from '@/app/proposals/create/CreateProposalHeaderSection'
import { useCreateBuilderWhitelistProposal } from '@/app/proposals/hooks/useCreateBuilderWhitelistProposal'
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
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Address } from 'viem'
import { z } from 'zod'
import { useVotingPowerRedirect } from '@/app/proposals/hooks/useVotingPowerRedirect'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/Accordion'
import { Header, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'
import { isAddressRegex, DISPLAY_NAME_SEPARATOR } from '@/app/proposals/shared/utils'
import { isBaseError, isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'

const FormSchema = z.object({
  builderName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  proposalName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  description: z
    .string()
    .max(3000)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
  builderAddress: z.string().refine(value => isAddressRegex(value), 'Please enter a valid address'),
})

export const CreateBuilderProposalForm: FC = () => {
  const router = useRouter()
  useVotingPowerRedirect()
  const { setMessage } = useAlertContext()
  const { onCreateBuilderWhitelistProposal, isPublishing } = useCreateBuilderWhitelistProposal()

  const [activeStep, setActiveStep] = useState('proposal')

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      builderName: '',
      proposalName: '',
      builderAddress: '' as Address,
      description: '',
    },
  })

  const {
    control,
    handleSubmit,
    formState: { touchedFields, errors, isValid, isDirty },
  } = form

  const isBuilderNameValid = !errors.builderName && touchedFields.builderName
  const isProposalNameValid = !errors.proposalName && touchedFields.proposalName
  const isDescriptionValid = !errors.description && touchedFields.description
  const isProposalCompleted = isBuilderNameValid && isProposalNameValid && isDescriptionValid

  const isBuilderAddressValid = !errors.builderAddress && touchedFields.builderAddress
  const isActionsCompleted = isBuilderAddressValid

  const handleProposalCompleted = () => setActiveStep('actions')

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const { builderName, proposalName, description, builderAddress } = data
    const proposalDescription = `${proposalName}${DISPLAY_NAME_SEPARATOR}${builderName};${description}`

    try {
      const txHash = await onCreateBuilderWhitelistProposal(builderAddress as Address, proposalDescription)
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

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CreateProposalHeaderSection
          proposalType={ProposalType.BUILDER_ACTIVATION}
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
                <Header variant="h1" className="text-[24px]" fontFamily="kk-topo">
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
                name="builderName"
                render={({ field }) => (
                  <FormItem className="mb-6 mx-1">
                    <FormLabel>Builder name</FormLabel>
                    <FormControl>
                      <FormInput placeholder="Write your builder/protocol name" {...field} maxLength={100} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="proposalName"
                render={({ field }) => (
                  <FormItem className="mb-6 mx-1">
                    <FormLabel>Proposal name</FormLabel>
                    <FormControl>
                      <FormInput placeholder="Write proposal name" {...field} maxLength={100} />
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
                <Header variant="h1" className="text-[24px]" fontFamily="kk-topo">
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
                    <FormLabel>Builder address</FormLabel>
                    <FormControl>
                      <FormInput
                        placeholder="Write or paste the builder address"
                        {...field}
                        maxLength={100}
                      />
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
