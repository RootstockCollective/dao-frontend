import { useStakeRIF } from '@/app/user/Stake/hooks/useStakeRIF'
import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { Button } from '@/components/ButtonNew/Button'
import { ProgressBar, ProgressButton } from '@/components/ProgressBarNew'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { config } from '@/config'
import Big from '@/lib/big'
import { formatNumberWithCommas } from '@/lib/utils'
import { waitForTransactionReceipt } from '@wagmi/core'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { StakeSteps } from './StakeSteps'
import { textsDependingOnAction } from './stepsUtils'

export const StepAllowance = ({ onGoNext = () => {}, onGoBack = () => {} }: StepProps) => {
  const { amount, tokenToSend, tokenToReceive, stakePreviewFrom: from, actionName } = useStakingContext()

  const {
    isAllowanceEnough,
    isAllowanceReadLoading,
    customFooter,
    onRequestAllowance,
    isRequestingAllowance,
  } = useStakeRIF(amount, tokenToSend.contract, tokenToReceive.contract)

  const [isAllowanceRequestPending, setIsAllowanceRequestPending] = useState(false)

  const handleRequestAllowance = async () => {
    if (!onRequestAllowance) {
      return
    }
    try {
      setIsAllowanceRequestPending(true)
      const txHash = await onRequestAllowance()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
    } catch (err) {
      console.error('Error requesting allowance', err)
    }
    setIsAllowanceRequestPending(false)
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

  console.log('🚀 ~ StepAllowance ~ isRequestingAllowance:', isRequestingAllowance)
  console.log('🚀 ~ StepAllowance ~ isAllowanceRequestPending:', isAllowanceRequestPending)
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

      <hr className="bg-bg-60 h-px border-0 mt-8 mb-6" />

      <div className="flex items-center justify-between mt-8">
        <div className="flex items-center gap-1 cursor-pointer">
          <Image src="/Images/info-icon.svg" alt="info" width={20} height={20} />
          <Span variant="tag-s">Help, I don&apos;t understand</Span>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary-outline"
            onClick={onGoBack}
            data-testid="Back"
            disabled={isAllowanceReadLoading || isRequestingAllowance || isAllowanceRequestPending}
          >
            Back
          </Button>
          {isAllowanceRequestPending || isRequestingAllowance ? (
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
              onClick={handleRequestAllowance}
              data-testid="Request allowance"
              disabled={
                isAllowanceReadLoading ||
                isRequestingAllowance ||
                isAllowanceRequestPending ||
                !amount ||
                Number(amount) <= 0
              }
            >
              {isRequestingAllowance ? 'Requesting...' : 'Request allowance'}
            </Button>
          )}
        </div>
      </div>
      {customFooter}
    </div>
  )
}
