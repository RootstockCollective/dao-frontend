import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { StepProps } from '@/app/user/Stake/types'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import { executeTxFlow } from '@/shared/notification'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { StakeTokenAmountDisplay } from '../components/StakeTokenAmountDisplay'
import { TransactionStatus } from '../components/TransactionStatus'
import { useAllowance } from '../hooks/useAllowance'
import { NewPopover } from '@/components/NewPopover'

export const StepTwo = ({ onGoNext, onGoBack }: StepProps) => {
  const {
    amount,
    tokenToSend,
    tokenToReceive,
    stakePreviewFrom: from,
    setButtonActions,
  } = useStakingContext()
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

  const handleRequestAllowance = useCallback(() => {
    executeTxFlow({
      onRequestTx: onRequestAllowance,
      onSuccess: onGoNext,
      action: 'allowance',
    })
  }, [onRequestAllowance, onGoNext])

  // Set button actions directly
  useEffect(() => {
    setButtonActions({
      primary: {
        label: isRequesting ? 'Requesting...' : 'Request allowance',
        onClick: handleRequestAllowance,
        disabled: isAllowanceReadLoading || !amount || Number(amount) <= 0,
        loading: isRequesting,
        isTxPending: isTxPending,
      },
      secondary: {
        label: 'Back',
        onClick: onGoBack,
        disabled: isAllowanceReadLoading,
        loading: false,
      },
    })
  }, [
    isAllowanceReadLoading,
    isRequesting,
    isTxPending,
    amount,
    onGoBack,
    handleRequestAllowance,
    setButtonActions,
  ])

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
    </>
  )
}

const HelpPopover = () => {
  const [popoverOpen, setPopoverOpen] = useState(false)

  return (
    <NewPopover
      open={popoverOpen}
      onOpenChange={setPopoverOpen}
      content={<HelpPopoverContent />}
      className="rounded-none p-6"
    >
      <div className="flex items-center gap-1">
        <Image src="/images/info-icon-sm.svg" alt="info" width={20} height={20} />
        <Span variant="tag-s">Help, I don&apos;t understand</Span>
      </div>
    </NewPopover>
  )
}

const HelpPopoverContent = () => {
  return (
    <div className="bg-text-80 rounded-lg p-4 max-w-xs flex flex-col gap-4">
      <div>
        <Span variant="tag-s" bold className="text-bg-100">
          Why request the allowance?
        </Span>
        <Paragraph variant="body-s" className="mt-2 text-bg-60">
          Token allowances are the crypto equivalent to spending caps. You grant permissions for the dApp or
          smart contract to spend a specific amount of your tokens and not go over this amount without further
          approval. The Collective implements these as an industry standard to help protect you and the
          community.
        </Paragraph>
      </div>
      <div>
        <Span variant="tag-s" bold className="text-bg-100">
          What is stRIF?
        </Span>
        <Paragraph variant="body-s" className="mt-2 text-bg-60">
          The Governance token used in the Collective. You can stake any amount of RIF tokens and receive an
          equivalent amount of staked RIF as stRIF tokens (in a 1:1 ratio) and this is how you take part in
          the Collective. This is the way.
        </Paragraph>
      </div>
    </div>
  )
}
