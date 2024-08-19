'use client'
import { useCreateProposal } from '@/app/proposals/hooks/useCreateProposal'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { TRANSACTION_SENT_MESSAGES } from '@/app/proposals/shared/utils'
import { useAlertContext } from '@/app/providers/AlertProvider'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion'
import { Alert } from '@/components/Alert/Alert'
import { Button } from '@/components/Button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormInput,
  FormInputNumber,
  FormItem,
  FormLabel,
  FormMessage,
  FormTextarea,
} from '@/components/Form'
import { MAX_INPUT_NUMBER_AMOUNT } from '@/components/Input/InputNumber'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Header, Paragraph } from '@/components/Typography'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoRocket } from 'react-icons/go'
import { Address, zeroAddress } from 'viem'
import { z } from 'zod'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

const FormSchema = z.object({
  proposalName: z
    .string()
    .max(100)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
  description: z
    .string()
    .max(3000)
    .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
  toAddress: z.string().refine(value => ADDRESS_REGEX.test(value), 'Please enter a valid address'),
  tokenAddress: z.string().length(42),
  amount: z.coerce
    .number({ invalid_type_error: 'Required field' })
    .positive('Required field')
    .min(1, 'Amount must be greater or equal to 1')
    .max(MAX_INPUT_NUMBER_AMOUNT),
})

export default function CreateProposal() {
  const router = useRouter()
  const prices = useGetSpecificPrices()
  const { isLoading: isVotingPowerLoading, canCreateProposal } = useVotingPower()
  const { onCreateProposal, isPublishing } = useCreateProposal()
  const { setMessage } = useAlertContext()

  const [activeStep, setActiveStep] = useState('proposal')

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      toAddress: '',
      tokenAddress: tokenContracts.RIF,
      amount: undefined,
    },
  })

  const {
    control,
    handleSubmit,
    formState: { touchedFields, errors, isValid, isDirty },
    watch,
  } = form

  const pricesMap = useMemo(
    () => ({ [tokenContracts.RIF]: prices.RIF, [tokenContracts.RBTC]: prices.RBTC }),
    [prices],
  )

  const isProposalNameValid = !errors.proposalName && touchedFields.proposalName
  const isDescriptionValid = !errors.description && touchedFields.description
  const isToAddressValid = !errors.toAddress && touchedFields.toAddress
  const isAmountValid = !errors.amount && touchedFields.amount
  const isProposalCompleted = isProposalNameValid && isDescriptionValid
  const isActionsCompleted = isToAddressValid && isAmountValid
  const amountValue = watch('amount')
  const tokenAddress = watch('tokenAddress')
  const amountUsd = pricesMap[tokenAddress] ? amountValue * pricesMap[tokenAddress]?.price : 0

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const { proposalName, description, toAddress, tokenAddress, amount } = data
    const proposalDescription = `${proposalName};${description}`

    onCreateProposal(toAddress as Address, amount.toString(), proposalDescription, tokenAddress)
      .then((txHash: Awaited<ReturnType<typeof onCreateProposal>>) => {
        router.push(`/proposals?txHash=${txHash}`)
      })
      .catch(err => {
        if (err?.cause?.code === 4001) {
          setMessage(TRANSACTION_SENT_MESSAGES.canceled)
        } else {
          setMessage(TRANSACTION_SENT_MESSAGES.error)
        }
      })
  }

  const handleProposalCompleted = () => setActiveStep('actions')

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
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <HeaderSection disabled={!isDirty || !isValid || isPublishing} loading={isPublishing} />
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
            <AccordionItem value="actions">
              <AccordionTrigger>
                <div className="flex justify-between align-middle w-full">
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
                        <FormInput placeholder="0x123...456" {...field} />
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
                              <SelectItem value={zeroAddress}>
                                <div className="flex items-center">
                                  {/*TODO: token icon*/}
                                  {/*<FaBitcoin className="mr-2" />*/}
                                  RBTC
                                </div>
                              </SelectItem>
                              <SelectItem value={tokenContracts.RIF as Address}>
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
                          <FormInputNumber
                            placeholder="0.00"
                            className="w-64"
                            autoComplete="off"
                            {...field}
                          />
                        </FormControl>
                        {amountValue?.toString() && (
                          <FormDescription>= USD {formatCurrency(amountUsd)}</FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </form>
      </Form>
    </MainContainer>
  )
}

const HeaderSection = ({ disabled = true, loading = false }) => (
  <div className="flex flex-row justify-between container pl-4">
    <Header variant="h2" className="font-semibold">
      Create proposal
    </Header>
    <div className="flex flex-row gap-x-6">
      <Button startIcon={<GoRocket />} disabled={disabled} buttonProps={{ type: 'submit' }} loading={loading}>
        Publish
      </Button>
    </div>
  </div>
)
