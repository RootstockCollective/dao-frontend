import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { Popover } from '@/components/Popover'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { config } from '@/config'
import { waitForTransactionReceipt } from '@wagmi/core'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Divider } from '../components/Divider'
import { StepActionButtons } from '../components/StepActionButtons'
import { StepWrapper } from '../components/StepWrapper'
import { TokenAmountDisplay } from '../components/TokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useAllowance } from '../hooks/useAllowance'

export const StepTwo = ({ onGoNext, onGoBack }: StepProps) => {
  const { amount, tokenToSend, tokenToReceive, stakePreviewFrom: from } = useStakingContext()

  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceHash,
  } = useAllowance(amount, tokenToSend.contract, tokenToReceive.contract)

  const handleRequestAllowance = async () => {
    try {
      const txHash = await onRequestAllowance()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      onGoNext()
    } catch (err) {
      if (!isUserRejectedTxError(err)) {
        console.error('Error requesting allowance', err)
      }
    }
  }

  const hasCalledOnGoNextRef = useRef(false)

  useEffect(() => {
    if (isAllowanceEnough && !hasCalledOnGoNextRef.current) {
      onGoNext()
      // prevent calling onGoNext multiple times.
      hasCalledOnGoNextRef.current = true
    }
  }, [isAllowanceEnough, onGoNext])

  const getPrimaryButtonLabel = () => {
    if (isAllowanceReadLoading) return 'Fetching allowance...'
    if (isRequesting) return 'Requesting...'
    return 'Request allowance'
  }

  return (
    <StepWrapper
      currentStep={2}
      progress={68}
      description="Before you can stake, you must first approve the allowance in your wallet."
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">{tokenToSend.symbol} smart contract</Header>
          </div>
        </div>
        <TokenAmountDisplay
          label="Allowance amount"
          amount={amount}
          tokenSymbol={tokenToSend.symbol}
          amountInCurrency={from.amountConvertedToCurrency}
          isFlexEnd
        />
      </div>

      <TransactionStatus
        txHash={allowanceHash}
        isTxFailed={isTxFailed}
        failureMessage="Allowance TX failed."
      />

      {/* Mobile: Show HelpPopover above hr */}
      <div className="block md:hidden mb-4">
        <HelpPopover />
      </div>

      <Divider />

      <StepActionButtons
        primaryButton={{
          label: getPrimaryButtonLabel(),
          onClick: handleRequestAllowance,
          disabled: isAllowanceReadLoading || !amount || Number(amount) <= 0,
        }}
        secondaryButton={{
          label: 'Back',
          onClick: onGoBack,
          disabled: isAllowanceReadLoading,
        }}
        isTxPending={isTxPending}
        isRequesting={isRequesting}
        additionalContent={<HelpPopover />}
      />
    </StepWrapper>
  )
}

const HelpPopover = () => {
  return (
    <Popover
      customContent={<HelpPopoverContent />}
      position="top"
      contentSubContainerClassName="rounded-none p-6"
    >
      <div className="flex items-center gap-1">
        <Image src="/images/info-icon.svg" alt="info" width={20} height={20} />
        <Span variant="tag-s">Help, I don&apos;t understand</Span>
      </div>
    </Popover>
  )
}

const HelpPopoverContent = () => {
  return (
    <div className="bg-text-80 rounded-lg p-4 max-w-xs flex flex-col gap-4">
      <div>
        <Span variant="body-s" bold className="text-bg-100">
          Why request the allowance?
        </Span>
        <Paragraph variant="body-s" className="mt-2 text-bg-60">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.
        </Paragraph>
      </div>
      <div>
        <Span variant="body-s" bold className="text-bg-100">
          What is stRIF?
        </Span>
        <Paragraph variant="body-s" className="mt-2 text-bg-60">
          Ipsum dolor sit amet, consectetur adipiscing elit.
        </Paragraph>
      </div>
    </div>
  )
}
