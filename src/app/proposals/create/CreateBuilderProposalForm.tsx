import { CreateProposalHeaderSection } from '@/app/proposals/create/CreateProposalHeaderSection'
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
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Address, isAddress } from 'viem'
import { z } from 'zod'
import { useVotingPowerRedirect } from '@/app/proposals/hooks/useVotingPowerRedirect'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/Accordion'
import { Header, Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'

const FormSchema = z.object({
  proposalName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  description: z
    .string()
    .max(3000)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
  builderAddress: z.string().refine(value => isAddress(value), 'Please enter a valid address'),
  receiverAddress: z
    .string()
    .refine(value => isAddress(value) || value === '', 'Please enter a valid address'),
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

  const [activeStep, setActiveStep] = useState('proposal')

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
    formState: { touchedFields, errors, isValid, isDirty },
  } = form

  const isProposalNameValid = !errors.proposalName && touchedFields.proposalName
  const isDescriptionValid = !errors.description && touchedFields.description
  const isProposalCompleted = isProposalNameValid && isDescriptionValid
  const isBuilderAddressValid = !errors.builderAddress && touchedFields.builderAddress
  const isReceiverAddressValid = !errors.receiverAddress && touchedFields.receiverAddress
  const isActionsCompleted = isBuilderAddressValid && isReceiverAddressValid

  const handleProposalCompleted = () => setActiveStep('actions')

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
              <FormField
                control={control}
                name="receiverAddress"
                render={({ field }) => (
                  <FormItem className="mb-6 mx-1">
                    <FormLabel>Receiver address (optional)</FormLabel>
                    <FormControl>
                      <FormInput
                        placeholder="Write or paste the receiver address"
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
