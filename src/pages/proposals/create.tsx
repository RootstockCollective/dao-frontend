'use client'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion'
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
import { Input } from '@/components/Input'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Textarea } from '@/components/Textarea'
import { Header, Paragraph } from '@/components/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaBitcoin } from 'react-icons/fa6'
import { GoRocket } from 'react-icons/go'
import { z } from 'zod'

const FormSchema = z.object({
  proposalName: z.string().min(3),
  description: z.string().min(3),
  toAddress: z.string().length(42),
  tokenSymbol: z.string(),
  amount: z.string().min(1),
})

export default function CreateProposal() {
  const [activeStep, setActiveStep] = useState('proposal')

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      toAddress: '',
      amount: undefined,
    },
  })

  const {
    control,
    handleSubmit,
    watch,
    formState: { touchedFields, errors, isValid, isDirty },
  } = form
  const isProposalNameValid = !errors.proposalName && touchedFields.proposalName
  const isDescriptionValid = !errors.description && touchedFields.description
  const isToAddressValid = !errors.toAddress && touchedFields.toAddress
  const isAmountValid = !errors.amount && touchedFields.amount
  const isProposalCompleted = isProposalNameValid && isDescriptionValid
  const isActionsCompleted = isToAddressValid && isAmountValid

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // TODO: connect to contract
    console.log(data)
  }

  const handleProposalCompleted = () => setActiveStep(isActionsCompleted ? '' : 'actions')

  const handleActionsCompleted = () => setActiveStep(isProposalCompleted ? '' : 'proposal')

  // remove later, just for debugging
  useEffect(() => {
    const sub = watch((value, { name, type }) => {
      console.log(value, name, type)
    })
    return () => sub.unsubscribe()
  }, [watch])

  return (
    <MainContainer>
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <HeaderSection disabled={!isDirty || !isValid} />
          {/* TODO: add an error alert when submiting form */}
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
                        <Input placeholder="name your proposal" {...field} />
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
                        <Textarea placeholder="Enter a description..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center mb-6">
                  <Button disabled={!isProposalCompleted} onClick={handleProposalCompleted}>
                    Save & Continue
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
                    name="tokenSymbol"
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
                              <SelectItem value="RBTC">
                                <div className="flex items-center">
                                  {/* TODO: token icon */}
                                  <FaBitcoin className="mr-2" />
                                  RBTC
                                </div>
                              </SelectItem>
                              <SelectItem value="stRIF">
                                <div className="flex items-center">
                                  <FaBitcoin className="mr-2" />
                                  stRIF
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
                          <Input placeholder="0.00" type="number" className="w-64" min={0} {...field} />
                        </FormControl>
                        <FormDescription>= $ USD 0.00</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-center mb-6">
                  <Button disabled={!isActionsCompleted} onClick={handleActionsCompleted}>
                    Save & Continue
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
