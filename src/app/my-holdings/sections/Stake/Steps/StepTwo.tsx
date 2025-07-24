import { useStakingContext } from '@/app/my-holdings/sections/Stake/StakingContext'
import { StepProps } from '@/app/my-holdings/sections/Stake/types'
import { Divider } from '@/components/Divider'
import { Popover } from '@/components/Popover'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { executeTxFlow } from '@/shared/notification'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { StepActionButtons } from '../components/StepActionButtons'
import { StakeTokenAmountDisplay } from '../components/StakeTokenAmountDisplay'
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
    allowanceTxHash,
  } = useAllowance(amount, tokenToSend.contract, tokenToReceive.contract)

  const hasCalledOnGoNextRef = useRef(false)

  useEffect(() => {
    if (isAllowanceEnough && !hasCalledOnGoNextRef.current) {
      onGoNext()
      // prevent calling onGoNext multiple times.
      hasCalledOnGoNextRef.current = true
    }
  }, [isAllowanceEnough, onGoNext])

  const primaryButtonLabel = useMemo(() => {
    if (isAllowanceReadLoading) return 'Fetching allowance...'
    if (isRequesting) return 'Requesting...'
    return 'Request allowance'
  }, [isAllowanceReadLoading, isRequesting])

  const handleRequestAllowance = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestAllowance,
      onSuccess: onGoNext,
      action: 'allowance',
    })
  }, [onRequestAllowance, onGoNext])

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">{tokenToSend.symbol} smart contract</Header>
          </div>
        </div>
        <StakeTokenAmountDisplay
          label="Allowance amount"
          amount={amount}
          tokenSymbol={tokenToSend.symbol}
          amountInCurrency={from.amountConvertedToCurrency}
          isFlexEnd
        />
      </div>

      <TransactionStatus
        txHash={allowanceTxHash}
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
          label: primaryButtonLabel,
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
    </>
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
        <Image src="/images/info-icon-sm.svg" alt="info" width={20} height={20} />
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
