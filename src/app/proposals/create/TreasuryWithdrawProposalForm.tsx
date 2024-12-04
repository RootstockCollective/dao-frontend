import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/Select'
import { Header, Paragraph } from '@/components/Typography'
import { CHAIN_ID, ENV } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import { TX_MESSAGES } from '@/shared/txMessages'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Address, zeroAddress } from 'viem'
import { z } from 'zod'
import { rbtcIconSrc } from '@/shared/rbtcIconSrc'
import { MAX_INPUT_NUMBER_AMOUNT } from '@/components/Input/InputNumber'
import { useGetSpecificPrices } from '@/app/user/Balances/hooks/useGetSpecificPrices'
import { useAlertContext } from '@/app/providers'
import { Button } from '@/components/Button'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormInput,
  FormTextarea,
  FormDescription,
  FormInputNumber,
  Form,
} from '@/components/Form'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/Accordion'
import { useVotingPower } from '@/app/proposals/hooks/useVotingPower'
import { useCreateTreasuryTransferProposal } from '@/app/proposals/hooks/useCreateTreasuryTransferProposal'
import React from 'react'
import { useForm } from 'react-hook-form'
import { CreateProposalHeaderSection } from '@/app/proposals/create/CreateProposalHeaderSection'
import { isAddressRegex, isChecksumValid } from '@/app/proposals/shared/utils'
import { isBaseError, isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'

const rifMinimumAmount = ENV === 'mainnet' ? 10 : 1
const rbtcMinimumAmount = ENV === 'mainnet' ? 0.0001 : 0.000001

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
      .refine(value => isAddressRegex(value), 'Please enter a valid address')
      .refine(value => isChecksumValid(value, CHAIN_ID), 'Address has invalid checksum'),
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
export const TreasuryWithdrawProposalForm = () => {
  const router = useRouter()
  const prices = useGetSpecificPrices()
  const { isLoading: isVotingPowerLoading, canCreateProposal } = useVotingPower()
  const { onCreateTreasuryTransferProposal, isPublishing } = useCreateTreasuryTransferProposal()
  const { setMessage } = useAlertContext()

  const [activeStep, setActiveStep] = useState('proposal')

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(FormSchema),
    defaultValues: {
      proposalName: '',
      description: '',
      toAddress: '' as Address,
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
      const txHash = await onCreateTreasuryTransferProposal(
        toAddress as Address,
        amount.toString(),
        proposalDescription,
        tokenAddress,
      )
      router.push(`/proposals?txHash=${txHash}`)
    } catch (err: any) {
      if (isUserRejectedTxError(err)) return
      if (isBaseError(err)) {
        setMessage({ ...TX_MESSAGES.proposal.error, content: err.message })
      } else {
        setMessage(TX_MESSAGES.proposal.error)
        console.error('🐛 Error writing to contract:', err)
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
                        <Select
                          onValueChange={(...args) => {
                            field.onChange(...args)
                            if (touchedFields.amount) {
                              trigger('amount')
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="InputAsset">
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
                          {...field}
                          data-testid="InputAmount"
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
  )
}
