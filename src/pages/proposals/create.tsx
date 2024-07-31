'use client'
import { useCreateProposal } from '@/app/proposals/hooks/useCreateProposal'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { TRANSACTION_SENT_MESSAGES } from '@/app/proposals/shared/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion'
import { Alert } from '@/components/Alert/Alert'
import { Button } from '@/components/Button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/Form'
import { Input, InputNumber } from '@/components/Input'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Textarea } from '@/components/Textarea'
import { Header, Paragraph } from '@/components/Typography'
import { currentEnvContracts } from '@/lib/contracts'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoRocket } from 'react-icons/go'
import { Address } from 'viem'
import { z } from 'zod'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/
const MAX_AMOUNT = 999999999

const FormSchema = z.object({
  proposalName: z.string().min(3).max(100),
  description: z.string().min(3).max(3000),
  toAddress: z.string().refine(value => ADDRESS_REGEX.test(value), 'Please enter a valid address'),
  tokenAddress: z.string().length(42),
  amount: z.coerce.number().positive('Required').min(1).max(MAX_AMOUNT),
})

export default function CreateProposal() {
  const router = useRouter()
  const { isLoading: isVotingPowerLoading, canCreateProposal } = useVotingPower()
  const { onCreateProposal } = useCreateProposal()
  const [message, setMessage] = useState<
    (typeof TRANSACTION_SENT_MESSAGES)[keyof typeof TRANSACTION_SENT_MESSAGES] | null
  >(null)

  const [activeStep, setActiveStep] = useState('proposal')

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      toAddress: '',
      tokenAddress: currentEnvContracts.RIF as Address,
      amount: undefined,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { touchedFields, errors, isValid, isDirty },
    watch,
  } = form

  const isProposalNameValid = !errors.proposalName && touchedFields.proposalName
  const isDescriptionValid = !errors.description && touchedFields.description
  const isToAddressValid = !errors.toAddress && touchedFields.toAddress
  const isAmountValid = !errors.amount && touchedFields.amount
  const isProposalCompleted = isProposalNameValid && isDescriptionValid
  const isActionsCompleted = isToAddressValid && isAmountValid
  const amountValue = watch('amount')

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const { proposalName, description, toAddress, tokenAddress, amount } = data
    const proposalDescription = `${proposalName};${description}`

    onCreateProposal(toAddress as Address, amount.toString(), proposalDescription)
      .then((txHash: Awaited<ReturnType<typeof onCreateProposal>>) => {
        router.push(`/proposals?txHash=${txHash}`)
      })
      .catch(err => {
        setMessage(TRANSACTION_SENT_MESSAGES.error)
      })
  }

  const handleProposalCompleted = () => setActiveStep('actions')

  const handleActionsCompleted = () => handleSubmit(onSubmit)()

  const onDismissMessage = () => setMessage(null)

  useEffect(() => {
    if (!isVotingPowerLoading && !canCreateProposal) {
      router.push('/proposals')
    }
  }, [canCreateProposal, isVotingPowerLoading, router])

  if (isVotingPowerLoading || !canCreateProposal) {
    return null
  }

  return (
    <MainContainer>
      {message && (
        <div className="mb-4">
          <Alert {...message} onDismiss={onDismissMessage} />
        </div>
      )}
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <HeaderSection disabled={!isDirty || !isValid} />
          <Accordion
            type="single"
            collapsible
            value={activeStep}
            onValueChange={setActiveStep}
            className="pl-4 container"
          >
            <AccordionItem value="proposal">
              <AccordionTrigger>
                <div className="flex justify-between inline-block align-middle w-full">
                  <Header variant="h1" className="text-[24px]">
                    Proposal
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
                        <Input placeholder="Name your proposal" {...field} maxLength={100} />
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
                        <Textarea placeholder="Enter a description..." {...field} maxLength={3000} />
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
            <AccordionItem value="actions">
              <AccordionTrigger>
                <div className="flex justify-between inline-block align-middle w-full">
                  <Header variant="h1" className="text-[24px]">
                    Actions
                  </Header>
                  {isActionsCompleted && (
                    <Paragraph className="self-center mr-6 text-md text-st-success">Completed</Paragraph>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <FormField
                  control={control}
                  name="toAddress"
                  render={({ field }) => (
                    <FormItem className="mb-6 mx-1">
                      <FormLabel>Transfer to</FormLabel>
                      <FormControl>
                        <Input placeholder="0x123...456" {...field} />
                      </FormControl>
                      <FormDescription>Write or paste the wallet address of the recipient</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-row">
                  <FormField
                    control={control}
                    name="tokenAddress"
                    render={({ field }) => (
                      <FormItem className="mb-6 mx-1">
                        <FormLabel>Change Asset</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {/* <SelectItem value={zeroAddress}>
                                <div className="flex items-center">
                                  TODO: token icon
                                  <FaBitcoin className="mr-2" />
                                  RBTC
                                </div>
                              </SelectItem> */}
                              <SelectItem value={currentEnvContracts.RIF as Address}>
                                <div className="flex items-center">
                                  <Image
                                    src="/images/rif-logo.png"
                                    alt="stRIF Logo"
                                    width={20}
                                    height={20}
                                    className="mr-1"
                                  />
                                  RIF
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="mb-6 mx-1">
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <InputNumber placeholder="0.00" className="w-64" max={MAX_AMOUNT} {...field} />
                        </FormControl>
                        {amountValue?.toString() && <FormDescription>= USD $0.00</FormDescription>}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center mb-6">
                  <Button
                    disabled={!isActionsCompleted || !isProposalCompleted}
                    onClick={handleActionsCompleted}
                  >
                    Publish
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </MainContainer>
  )
}

const HeaderSection = ({ disabled = true }) => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold font-[18px]">
      Create proposal
    </Header>
    <div className="flex flex-row gap-x-6">
      <Button startIcon={<GoRocket />} disabled={disabled} buttonProps={{ type: 'submit' }}>
        Publish
      </Button>
    </div>
  </div>
)
