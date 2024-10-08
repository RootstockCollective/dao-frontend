'use client'
import { useCreateProposal } from '@/app/proposals/hooks/useCreateProposal'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { useAlertContext } from '@/app/providers/AlertProvider'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/Accordion'
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
import { ENV } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import { rbtcIconSrc } from '@/shared/rbtcIconSrc'
import { TX_MESSAGES } from '@/shared/txMessages'
import { zodResolver } from '@hookform/resolvers/zod'
import { isAddress, isValidChecksumAddress, toChecksumAddress } from '@/lib/addresses'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoRocket } from 'react-icons/go'
import { Address, zeroAddress } from 'viem'
import { z } from 'zod'

const rifMinimumAmount = ENV === 'mainnet' ? 10 : 1
const rbtcMinimumAmount = ENV === 'mainnet' ? 0.0001 : 0.000001
const chainId = ENV === 'mainnet' ? 30 : 31

const FormSchema = z
  .object({
    proposalName: z
      .string()
      .max(100)
      .refine(s => s.trim().replace(/\s+/g, ' ').length >= 5, 'Field must contain at least 5 characters'),
    description: z
      .string()
      .max(3000)
      .refine(s => s.trim().replace(/\s+/g, ' ').length >= 10, 'Field must contain at least 10 characters'),
    toAddress: z
      .string()
      .refine(value => isAddress(value), 'Please enter a valid address')
      .refine(
        value => isValidChecksumAddress(value, chainId) || value === value.toLowerCase(),
        'Invalid checksum',
      ),
    tokenAddress: z.string().length(42),
    amount: z.coerce
      .number({ invalid_type_error: 'Required field' })
      .positive('Required field')
      .max(MAX_INPUT_NUMBER_AMOUNT),
  })
  .refine(data => data.tokenAddress === zeroAddress || Number(data.amount) >= rifMinimumAmount, {
    message: `The minimum amount for ERC20 tokens is ${rifMinimumAmount}.0`,
    path: ['amount'],
  })
  .refine(data => data.tokenAddress !== zeroAddress || Number(data.amount) >= rbtcMinimumAmount, {
    message: `The minimum amount for RBTC is ${rbtcMinimumAmount}`,
    path: ['amount'],
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
    trigger,
    setValue,
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

    try {
      const txHash = await onCreateProposal(
        toAddress as Address,
        amount.toString(),
        proposalDescription,
        tokenAddress,
      )
      router.push(`/proposals?txHash=${txHash}`)
    } catch (err: any) {
      if (err?.cause?.code !== 4001) {
        setMessage(TX_MESSAGES.proposal.error)
      }
    }
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
                        <FormInput
                          placeholder="Name your proposal"
                          {...field}
                          maxLength={100}
                          data-testid="InputName"
                        />
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
                          placeholder="Enter a description..."
                          {...field}
                          maxLength={3000}
                          data-testid="InputDescription"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center mb-6">
                  <Button
                    disabled={!isProposalCompleted}
                    onClick={handleProposalCompleted}
                    data-testid="Continue"
                  >
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
                  name="toAddress"
                  render={({ field }) => (
                    <FormItem className="mb-6 mx-1">
                      <FormLabel>Transfer to</FormLabel>
                      <FormControl>
                        <FormInput placeholder="0x123...456" {...field} data-testid="InputTransfer" />
                      </FormControl>
                      <FormDescription>Write or paste the wallet address of the recipient</FormDescription>
                      <FormMessage>
                        {errors.toAddress?.message === 'Invalid checksum' ? (
                          <>
                            Please check that the address is correct before continuing. If the address is
                            correct, use the button below to convert your address to a valid checksum address.{' '}
                            <span
                              className="text-white underline cursor-pointer"
                              onClick={() => {
                                setValue('toAddress', toChecksumAddress(field.value, chainId))
                                trigger('toAddress')
                              }}
                            >
                              Fix address.
                            </span>
                          </>
                        ) : undefined}
                      </FormMessage>
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
                          <Select
                            onValueChange={(...args) => {
                              field.onChange(...args)
                              if (touchedFields.amount) {
                                trigger('amount')
                              }
                            }}
                            defaultValue={field.value}
                            data-testid="InputAsset"
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select an asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={zeroAddress}>
                                <div className="flex items-center">
                                  <Image
                                    src={`data:image/svg+xml;base64,${rbtcIconSrc}`}
                                    alt="rBTC Logo"
                                    className="mr-1"
                                    width={20}
                                    height={20}
                                  />
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
                            data-testid="InputAmount"
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
      <Button
        startIcon={<GoRocket />}
        disabled={disabled}
        buttonProps={{ type: 'submit' }}
        loading={loading}
        data-testid="Publish"
      >
        Publish
      </Button>
    </div>
  </div>
)
