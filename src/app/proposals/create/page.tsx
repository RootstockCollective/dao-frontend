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
import { Textarea } from '@/components/Textarea'
import { Header, Paragraph } from '@/components/Typography'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoRocket } from 'react-icons/go'
import { z } from 'zod'

const FormSchema = z.object({
  proposalName: z.string().min(3),
  description: z.string().min(3),
  toAddress: z.string().length(42),
  amount: z.string(),
})

export default function CreateProposal() {
  const [activeStep, setActiveStep] = useState('proposal')
  const [description, setDescription] = useState('')

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      toAddress: '',
      amount: undefined,
    },
  })

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log(data)
  }

  const isProposalCompleted = false
  const isActionsCompleted = false

  const handleProposalCompleted = () => setActiveStep(isActionsCompleted ? '' : 'actions')

  const handleActionsCompleted = () => setActiveStep(isProposalCompleted ? '' : 'proposal')

  useEffect(() => {
    const sub = form.watch((value, { name, type }) => {
      console.log(value, name, type)
    })
    return () => sub.unsubscribe()
  }, [form, form.watch])

  return (
    <MainContainer>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <HeaderSection disabled={!isProposalCompleted || !isActionsCompleted} />
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
                  control={form.control}
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
                <Textarea
                  label="Description"
                  placeholder="Enter a description..."
                  value={description}
                  onChange={setDescription}
                  name="description"
                  fullWidth
                  className="mb-6 mx-1"
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
                  control={form.control}
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
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="mb-6 mx-1">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" type="number" className="w-auto" {...field} />
                      </FormControl>
                      <FormDescription>= $ USD 0.00</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
      <Button startIcon={<GoRocket />} buttonProps={{ type: 'submit' }}>
        Publish
      </Button>
    </div>
  </div>
)
