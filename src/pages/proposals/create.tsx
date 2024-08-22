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
import { tokenContracts } from '@/lib/contracts'
import { formatCurrency } from '@/lib/utils'
import { TX_MESSAGES } from '@/shared/txMessages'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { GoRocket } from 'react-icons/go'
import { Address, zeroAddress } from 'viem'
import { z } from 'zod'

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/

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
    toAddress: z.string().refine(value => ADDRESS_REGEX.test(value), 'Please enter a valid address'),
    tokenAddress: z.string().length(42),
    amount: z.coerce
      .number({ invalid_type_error: 'Required field' })
      .positive('Required field')
      .max(MAX_INPUT_NUMBER_AMOUNT),
  })
  .refine(
    data => {
      if (data.tokenAddress !== zeroAddress) {
        // Do not allow decimals
        if (Number(data.amount) < 1) {
          return false
        }
      }
      return true
    },
    {
      message: 'Amount must be greater or equal to 1 for ERC20',
      path: ['amount'],
    },
  )

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
                              <SelectTrigger>
                                <SelectValue placeholder="Select an asset" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={zeroAddress}>
                                <div className="flex items-center">
                                  <Image
                                    src="data:image/svg+xml;base64,ICA8c3ZnCiAgICAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgICAgd2lkdGg9IjMzIgogICAgICBoZWlnaHQ9IjMzIgogICAgICBmaWxsPSJub25lIgogICAgICB2aWV3Qm94PSIwIDAgMzMgMzMiCiAgICA+CiAgICAgIDxwYXRoCiAgICAgICAgZmlsbD0iI0ZGOTkzMSIKICAgICAgICBkPSJNMTQuMzcgMjkuMzFhMTIuNjcyIDEyLjY3MiAwIDAxLTguOTkzLTMuNzMyIDEyLjcwNyAxMi43MDcgMCAwMS0zLjcyNS05LjAxYzAtMS43Mi4zMzYtMy4zODggMS00Ljk2YTEyLjY5OCAxMi42OTggMCAwMTIuNzI1LTQuMDUgMTIuNjggMTIuNjggMCAwMTguOTkzLTMuNzMxIDEyLjY3MyAxMi42NzMgMCAwMTguOTkzIDMuNzMyIDEyLjcwNyAxMi43MDcgMCAwMTMuNzI1IDkuMDFjMCAxLjcyLS4zMzcgMy4zODgtMSA0Ljk2YTEyLjY5OSAxMi42OTkgMCAwMS0yLjcyNiA0LjA1IDEyLjY4MiAxMi42ODIgMCAwMS04Ljk5MiAzLjczMnoiCiAgICAgID48L3BhdGg+CiAgICAgIDxwYXRoCiAgICAgICAgZmlsbD0iI2ZmZiIKICAgICAgICBkPSJNMTQuMzcgNC4wMTZjNi45MiAwIDEyLjUzIDUuNjIgMTIuNTMgMTIuNTUzIDAgNi45MzMtNS42MSAxMi41NTMtMTIuNTMgMTIuNTUzLTYuOTIgMC0xMi41My01LjYyLTEyLjUzLTEyLjU1MyAwLTYuOTMzIDUuNjEtMTIuNTUzIDEyLjUzLTEyLjU1M3ptMC0uMzc4YTEyLjg2IDEyLjg2IDAgMDAtOS4xMjYgMy43ODcgMTIuODkgMTIuODkgMCAwMC0zLjc4IDkuMTQ0IDEyLjg4OCAxMi44ODggMCAwMDMuNzggOS4xNDMgMTIuODY0IDEyLjg2NCAwIDAwOS4xMjYgMy43ODcgMTIuODYgMTIuODYgMCAwMDkuMTI2LTMuNzg3IDEyLjg5MyAxMi44OTMgMCAwMDMuNzgtOS4xNDNjMC0xLjc0Ni0uMzQyLTMuNDQtMS4wMTUtNS4wMzRhMTIuODkgMTIuODkgMCAwMC0yLjc2Ni00LjExIDEyLjg2NCAxMi44NjQgMCAwMC05LjEyNi0zLjc4N3oiCiAgICAgID48L3BhdGg+CiAgICAgIDxwYXRoCiAgICAgICAgZmlsbD0iIzAwNkUzQyIKICAgICAgICBkPSJNMjkuMzAyIDguNjE3Yy0uNjYtLjI4NC0xLjYyMy0uNjA0LTIuNjctLjY0Mi0uODYyLS4wMzItMS42MzguMTM1LTIuMzA3LjQ5NWEzLjkwOCAzLjkwOCAwIDAwLS4zODguMjRjLTEuMDcxLjc1My0xLjYxOSAxLjk0LTEuODkzIDIuODQ5bC0uMTE3LjM4OS4zNTYtLjE5IDEuODg0LTEuMDExYS43NTMuNzUzIDAgMDExLjAxNS4yOTRsLjAwNS4wMDcuMDEuMDE5YS43MDUuNzA1IDAgMDEuMDMzLjA3bDQuMzQyLTIuNDA5Yy0uMDQtLjAxOC0uMjI4LS4wOTMtLjI3LS4xMTF6IgogICAgICA+PC9wYXRoPgogICAgICA8cGF0aAogICAgICAgIGZpbGw9IiMwNkIyM0MiCiAgICAgICAgZD0iTTI4LjYxNSAxMS41MzNjLTIuMTUyIDMuNTYyLTUuOTg1IDEuNzg4LTUuOTg1IDEuNzg4bDEuMzgzLS43NDNjLjExNS0uMDcuODctLjQ2Ny44Ny0uNDY3LjY2Mi0uNDIxLjI4NS0xLjA3OC4zMTUtMS4wMTRsNC4zNzUtMi4zNjlzLS4wODYgMS4zNi0uOTU5IDIuODA1eiIKICAgICAgPjwvcGF0aD4KICAgICAgPHBhdGgKICAgICAgICBmaWxsPSIjZmZmIgogICAgICAgIGQ9Ik0zMC43NTIgNy42MWMtLjE5LS4xMTEtMS45NC0xLjEwOC00LjA2My0xLjE4NS0xLjEzLS4wNDEtMi4xNjcuMTg4LTMuMDc4LjY4LS4zMDQuMTY0LS41ODEuMzUtLjgzNC41NTMtMS45MTcgMS41MzctMi40MTMgNC4wMjUtMi41NCA1LjEybC0uMDEuMDg2LS4wNzguMDQzLS41NjIuM2MtLjUzOC0uNTUyLTEuMzQtLjk1Ny0xLjk1NC0xLjEyNmwtLjEwOS0uMDMuNTYyLTIuMjQtMS4zMzUtLjM0Ny0uNTU3IDIuMjI1YTI2OC45OCAyNjguOTggMCAwMC0xLjAwNi0uMjdsLjU1NS0yLjIxNi0xLjMzNS0uMzQ2LS41NTMgMi4yMDljLTEuNjItLjQyNS0yLjY1OC0uNjgzLTIuNjU4LS42ODNzLS4yMjMgMS4xMjMtLjMyIDEuMzkzYzAgMCAuMjc1LjA2Ny41NzIuMTU0LjE5NC4wNTcgMS4xNDguMTU5LjgzIDEuMzQ0LS4xNzkuNjY1LTEuMjIgNS4xMjYtMS4zMDIgNS40My0uMDk0LjM1NS0uMTkxLjU1NC0uNjMuNDU2bC0xLjA2NS0uMjM4LS42NjkgMS41OTdjLjI0My4wODMgMS4wODIuMjc4IDIuNjcyLjY4MWwtLjU1MiAyLjIwMyAxLjMzNS4zNDYuNTUzLTIuMjA1Yy4zMTQuMDgxLjY1MS4xNyAxLjAwNy4yNjRsLS41NTIgMi4yMDIgMS4zMzQuMzQ2LjU2Mi0yLjIzOGMxLjU1Mi4yOSAyLjQ0Ny4xOTggMi42NTkuMTU4IDEuMjk2LS4yNCAxLjg0Ny0xLjI0IDIuMDg2LTIuMTkzLjY3My0yLjY4Ni0xLjUzNC0yLjkyMy0xLjI1NS0yLjk4IDEuMjM2LS4yNSAxLjgyNy0xLjQzMyAxLjc2LTIuNDg0bC42My0uMzM3LjA3OS0uMDQzLjA3Ni4wNDJjLjgyNi40MyAyLjEyLjk1NSAzLjU5IDEuMDFhNS43MzQgNS43MzQgMCAwMDIuNjA5LS41Yy4xMTMtLjA1LjIyNC0uMTA2LjMzMi0uMTY1IDMuMTQ5LTEuNjk2IDMuNTU2LTUuODI2IDMuNTkxLTYuMjkxbC4wMzEtLjQ4LS40MDgtLjI0NXptLTEzLjY4IDExLjkxNmMtLjM2NyAxLjQ2NC0yLjg0NS43MjYtMi44NDUuNzI2bC0xLjE3Ny0uMzA1LjczNC0yLjkyOCAxLjQwNi4zNjRzMi4yOTUuNDk4IDEuODgyIDIuMTQzem0uNDQxLTQuMzY0Yy0uMzM3IDEuMzQzLTIuNC43Mi0yLjQuNzJsLS45OC0uMjU0LjY3My0yLjY4NyAxLjE3Mi4zMDRzMS45MTQuNDA4IDEuNTM1IDEuOTE3em0xMi4wMTMtNi4zMTlsLS4wMDIuMDE3Yy0uMjE3IDEuMjE3LS44NTcgMy40MDctMi43IDQuNGExLjE5IDEuMTkgMCAwMS0uMDUuMDI0Yy0uNjMyLjMzLTEuMzQ5LjQ4My0yLjEzMS40NTRhNi4xMyA2LjEzIDAgMDEtMS42My0uMjk1bC0uMzgyLS4xMjIuMzU0LS4xOTEgMS44OTgtMS4wMmEuNzcuNzcgMCAwMC40MDEtLjY1Ni43NzEuNzcxIDAgMDAtLjA4Ni0uMzg3bC0uMDEtLjAyLS4wMDYtLjAwN2EuNzUzLjc1MyAwIDAwLTEuMDE1LS4yOTRsLTEuODg0IDEuMDEtLjM1Ni4xOTEuMTE3LS4zODljLjI3NC0uOTA4LjgyMi0yLjA5NiAxLjg5NC0yLjg0OC4xMjItLjA4Ni4yNTEtLjE2Ni4zODctLjI0LjY2OS0uMzYgMS40NDYtLjUyNyAyLjMwNy0uNDk1IDEuMDQ3LjAzOCAyLjAxLjM1NyAyLjY3LjY0MWwuMTI0LjA1NC4xMTcuMDU4LS4wMTcuMTE1eiIKICAgICAgPjwvcGF0aD4KICAgIDwvc3ZnPg=="
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
