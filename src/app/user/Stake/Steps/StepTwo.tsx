import { useStakingContext } from '@/app/user/Stake/StakingContext'
import { textsDependingOnAction } from '@/app/user/Stake/Steps/stepsUtils'
import { StepProps } from '@/app/user/Stake/types'
import { Button } from '@/components/ButtonNew/Button'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { ExternalLink } from '@/components/Link/ExternalLink'
import { ProgressBar, ProgressButton } from '@/components/ProgressBarNew'
import { TokenImage } from '@/components/TokenImage'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { config } from '@/config'
import Big from '@/lib/big'
import { EXPLORER_URL } from '@/lib/constants'
import { cn, formatNumberWithCommas } from '@/lib/utils'
import { showToast } from '@/shared/lib/toastUtils'
import { TX_MESSAGES } from '@/shared/txMessages'
import Image from 'next/image'
import { waitForTransactionReceipt } from 'wagmi/actions'
import { useStakeRIF } from '../hooks/useStakeRIF'
import { StakeSteps } from './StakeSteps'

export const StepTwo = ({ onCloseModal = () => {} }: StepProps) => {
  const {
    amount,
    tokenToReceive,
    actionName,
    stakePreviewFrom: from,
    stakePreviewTo: to,
  } = useStakingContext()

  const { onRequestStake, isRequesting, isTxPending, isTxFailed, stakeHash } = useStakeRIF(
    amount,
    tokenToReceive.contract,
  )

  const handleConfirmStake = async () => {
    try {
      const txHash = await onRequestStake()
      await waitForTransactionReceipt(config, {
        hash: txHash,
      })
      onCloseModal()
    } catch (err: any) {
      if (!isUserRejectedTxError(err)) {
        showToast(TX_MESSAGES.staking.error)
      }
    }
  }

  return (
    <div className="p-6">
      <Header className="mt-16 mb-4">{textsDependingOnAction[actionName].modalTitle}</Header>

      <div className="mb-12">
        <StakeSteps currentStep={3} />
        <ProgressBar progress={100} className="mt-3" />
      </div>

      <Paragraph variant="body" className="mb-8">
        Make sure that everything is correct before continuing:
      </Paragraph>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
        <div className="flex-1 mb-4 md:mb-0">
          <Label variant="tag" className="text-bg-0">
            From
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1" className="font-bold">
              {formatNumberWithCommas(Big(amount).toFixedNoTrailing(8))}
            </Header>
            <TokenImage symbol={from.tokenSymbol} size={24} />
            <Span variant="body-l" bold>
              {from.tokenSymbol}
            </Span>
          </div>
          <Span variant="body-s" bold className="text-bg-0 mt-1">
            {from.amountConvertedToCurrency}
          </Span>

          <div className="flex items-center gap-2 mt-4">
            <TokenImage symbol={from.tokenSymbol} size={12} />
            <Paragraph variant="body-s" className="text-bg-0">
              Balance: {formatNumberWithCommas(Big(from.balance).toFixedNoTrailing(8))}
            </Paragraph>
          </div>
        </div>
        <div className="flex-1 flex-col md:items-end">
          <Label variant="tag" className="text-bg-0">
            To
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Header variant="h1" className="font-bold">
              {formatNumberWithCommas(Big(amount).toFixedNoTrailing(8))}
            </Header>
            <TokenImage symbol={to.tokenSymbol} size={24} />
            <Span variant="body-l" bold>
              {to.tokenSymbol}
            </Span>
          </div>
          <Span variant="body-s" bold className="text-bg-0 mt-1">
            {to.amountConvertedToCurrency}
          </Span>

          <div className="flex items-center gap-2 mt-4">
            <TokenImage symbol={to.tokenSymbol} size={12} />
            <Paragraph variant="body-s" className="text-bg-0">
              Balance: {formatNumberWithCommas(Big(to.balance).toFixedNoTrailing(8))}
            </Paragraph>
          </div>
        </div>
      </div>

      {stakeHash && (
        <div className="flex flex-col mb-5">
          {isTxFailed && (
            <div className="flex items-center gap-2">
              <Image src="/images/warning-icon.svg" alt="Warning" width={40} height={40} />
              <Paragraph variant="body" className="text-error">
                Stake TX failed.
              </Paragraph>
            </div>
          )}
          <div className={cn({ 'ml-12': isTxFailed })}>
            <ExternalLink href={`${EXPLORER_URL}/tx/${stakeHash}`} target="_blank" variant="menu">
              <Span variant="body-s" bold>
                View transaction in Explorer
              </Span>
            </ExternalLink>
          </div>
        </div>
      )}

      <hr className="bg-bg-60 h-px border-0 mb-6" />

      <div className="flex flex-col md:flex-row md:items-center md:justify-end mt-8 gap-4">
        <div className="flex gap-4">
          <Button
            variant="secondary-outline"
            onClick={onCloseModal}
            data-testid="Cancel"
            disabled={isRequesting}
          >
            Cancel
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
              onClick={handleConfirmStake}
              data-testid="Confirm stake"
              disabled={isRequesting || !amount || Number(amount) <= 0}
            >
              {isRequesting ? 'Requesting...' : 'Confirm stake'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
