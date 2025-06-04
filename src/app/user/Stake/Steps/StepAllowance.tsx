import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { Button } from '@/components/ButtonNew/Button'
import { Popover } from '@/components/Popover'
import { ProgressBar, ProgressButton } from '@/components/ProgressBarNew'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { config } from '@/config'
import Big from '@/lib/big'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import Image from 'next/image'
import { useEffect, useMemo, useRef } from 'react'
import { StakeSteps } from './StakeSteps'
import { textsDependingOnAction } from './stepsUtils'
import { ExternalLink } from '@/components/Link/ExternalLink'
import { EXPLORER_URL } from '@/lib/constants'
import { useAllowance } from '../hooks/useAllowance'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'

export const StepAllowance = ({ onGoNext = () => {}, onGoBack = () => {} }: StepProps) => {
  const { amount, tokenToSend, tokenToReceive, stakePreviewFrom: from, actionName } = useStakingContext()

  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    onRequestAllowance,
    isRequesting,
    isTxPending,
    isTxFailed,
    allowanceHash,
  } = useAllowance({
    amount,
    tokenToSendContract: tokenToSend.contract,
    tokenToReceiveContract: tokenToReceive.contract,
  })

  const handleRequestAllowance = async () => {
    try {
      const txHash = await onRequestAllowance()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
    } catch (err) {
      if (!isUserRejectedTxError(err)) {
        console.error('Error requesting allowance', err)
      }
    }
  }

  const hasCalledOnGoNextRef = useRef(false)
  const actionTexts = useMemo(() => textsDependingOnAction[actionName], [actionName])

  useEffect(() => {
    if (isAllowanceEnough && !hasCalledOnGoNextRef.current) {
      onGoNext()
      // prevent calling onGoNext multiple times.
      hasCalledOnGoNextRef.current = true
    }
  }, [isAllowanceEnough, onGoNext])

  return (
    <div className="p-6">
      <Header className="mt-16 mb-4">{actionTexts.modalTitle}</Header>

      <div className="mb-12">
        <StakeSteps currentStep={2} />
        <ProgressBar progress={68} className="mt-3" />
      </div>

      <Paragraph variant="body" className="mb-8">
        Before you can stake, you must first approve the allowance in your wallet.
      </Paragraph>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            Interacting with
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1">{tokenToSend.symbol} smart contract</Header>
          </div>
        </div>
        <div className="flex-1 flex-col md:items-end">
          <Label variant="tag" className="text-bg-0">
            Allowance amount
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1" className="font-bold">
              {formatNumberWithCommas(Big(amount).toFixedNoTrailing(8))}
            </Header>
            <TokenImage symbol={tokenToSend.symbol} size={24} />
            <Span variant="body-l" bold>
              {tokenToSend.symbol}
            </Span>
          </div>
          <Span variant="body-s" bold className="text-bg-0 mt-1">
            {from.amountConvertedToCurrency}
          </Span>
        </div>
      </div>

      {allowanceHash && (
        <div className="flex flex-col mb-5">
          {isTxFailed && (
            <div className="flex items-center gap-2">
              <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
              <Paragraph variant="body" className="text-error">
                Allowance TX failed.
              </Paragraph>
            </div>
          )}
          <div className={cn({ 'ml-12': isTxFailed })}>
            <ExternalLink href={`${EXPLORER_URL}/tx/${allowanceHash}`} target="_blank" variant="menu">
              <Span variant="body-s" bold>
                View transaction in Explorer
              </Span>
            </ExternalLink>
          </div>
        </div>
      )}

      {/* Mobile: Show HelpPopover above hr */}
      <div className="block md:hidden mb-4">
        <HelpPopover />
      </div>

      <hr className="bg-bg-60 h-px border-0 mb-6" />

      {/* Desktop: Show HelpPopover next to buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-8 gap-4">
        <div className="hidden md:inline">
          <HelpPopover />
        </div>
        <div className="flex gap-4">
          <Button
            variant="secondary-outline"
            onClick={onGoBack}
            data-testid="Back"
            disabled={isAllowanceReadLoading || isRequesting}
          >
            Back
          </Button>
          {isTxPending ? (
            <ProgressButton className="whitespace-nowrap">
              <Span bold className="text-text-60">
                In progress
              </Span>
              <Span className="text-text-80 hidden md:inline">&nbsp;- 2 mins average</Span>
              <Span className="text-text-80 md:hidden">&nbsp;- 2 mins avg</Span>
            </ProgressButton>
          ) : (
            <Button
              variant="primary"
              className="w-full md:w-auto"
              onClick={handleRequestAllowance}
              data-testid="Request allowance"
              disabled={isAllowanceReadLoading || isRequesting || !amount || Number(amount) <= 0}
            >
              {isAllowanceReadLoading
                ? 'Fetching allowance...'
                : isRequesting
                  ? 'Requesting...'
                  : 'Request allowance'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

const HelpPopover = () => {
  return (
    <Popover
      contentV2={<HelpPopoverContent />}
      position="top"
      contentSubContainerClassName="rounded-none p-6"
    >
      <div className="flex items-center gap-1">
        <Image src="/Images/info-icon.svg" alt="info" width={20} height={20} />
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
