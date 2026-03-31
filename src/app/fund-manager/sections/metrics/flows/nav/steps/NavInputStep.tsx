'use client'

import Image from 'next/image'
import { useCallback, useEffect } from 'react'

import { SimpleAmountInputSection } from '@/app/fund-manager/components/SimpleAmountInputSection'
import { FlowStepProps } from '@/app/fund-manager/types'
import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { executeTxFlow } from '@/shared/notification'

import { useUpdateNav } from '../hooks/useUpdateNav'
import { useUpdateNavContext } from '../UpdateNavContext'

export const NavInputStep = ({ onCloseModal, setButtonActions }: FlowStepProps) => {
  const {
    reportedOffchainAmount,
    isValidAmount,
    errorMessage,
    currentNav,
    navUpdateReview,
    currentReportedOffchain,
    reportedOffchainWei,
    reportedOffchainWarnings,
    vaultReadsLoading,
    handleReportedOffchainAmountChange,
    refetchNav,
  } = useUpdateNavContext()

  const { onRequestTransaction, isRequesting, isTxPending } = useUpdateNav(reportedOffchainWei ?? 0n)

  const handleUpdateNav = useCallback(() => {
    if (reportedOffchainWei === null) return
    executeTxFlow({
      onRequestTx: onRequestTransaction,
      onSuccess: () => {
        refetchNav()
        onCloseModal()
      },
      action: 'updateNav',
    })
  }, [onCloseModal, onRequestTransaction, refetchNav, reportedOffchainWei])

  useEffect(() => {
    setButtonActions({
      primary: {
        label: isRequesting ? 'Updating...' : 'Update NAV',
        onClick: handleUpdateNav,
        disabled: vaultReadsLoading || !isValidAmount || reportedOffchainWei === null,
        loading: isRequesting,
        isTxPending,
      },
    })
  }, [
    handleUpdateNav,
    isRequesting,
    isTxPending,
    isValidAmount,
    reportedOffchainWei,
    setButtonActions,
    vaultReadsLoading,
  ])

  const currentNavAmountDisplay = currentNav.amount
  const currentReportedDisplay = currentReportedOffchain.amount

  const navAfterAmountDisplay = navUpdateReview?.navAfterDisplay ?? null
  const navDeltaAmountDisplay = navUpdateReview?.navDeltaDisplay ?? null

  return (
    <div className="flex flex-col gap-8">
      <SimpleAmountInputSection
        title="New reported off-chain"
        amount={reportedOffchainAmount}
        onAmountChange={handleReportedOffchainAmountChange}
        usdEquivalent={navUpdateReview?.reportedNewFiatDisplay ?? ''}
        errorMessage={errorMessage}
        tokenSymbol={RBTC}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-2 gap-y-6 w-full">
        <div className="flex flex-col gap-0.5">
          <Label variant="tag" className="text-bg-0">
            Current NAV
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Span>{currentNavAmountDisplay}</Span>
            <div className="flex items-center gap-0.5 shrink-0 py-px rounded-sm">
              <TokenImage symbol={RBTC} size={16} />
              <Label variant="body-s" bold>
                {RBTC}
              </Label>
            </div>
          </div>
          {currentNav.fiatAmount && (
            <Label variant="tag-s" className="text-bg-0">
              {currentNav.fiatAmount}
            </Label>
          )}
        </div>

        <div className="flex flex-col gap-0.5">
          <Label variant="tag" className="text-bg-0">
            Current reported off-chain
          </Label>
          <div className="flex flex-wrap items-center gap-2">
            <Span>{currentReportedDisplay}</Span>
            <div className="flex items-center gap-0.5 shrink-0 py-px rounded-sm">
              <TokenImage symbol={RBTC} size={16} />
              <Label variant="body-s" bold>
                {RBTC}
              </Label>
            </div>
          </div>
          {currentReportedOffchain.fiatAmount && (
            <Label variant="tag-s" className="text-bg-0">
              {currentReportedOffchain.fiatAmount}
            </Label>
          )}
        </div>

        {navUpdateReview && (
          <>
            <div className="flex flex-col gap-0.5">
              <Label variant="tag" className="text-bg-0">
                Estimated NAV after update
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Span>{navAfterAmountDisplay}</Span>
                <div className="flex items-center gap-0.5 shrink-0 py-px rounded-sm">
                  <TokenImage symbol={RBTC} size={16} />
                  <Label variant="body-s" bold>
                    {RBTC}
                  </Label>
                </div>
              </div>
              {navUpdateReview.navAfterFiatDisplay && (
                <Label variant="tag-s" className="text-bg-0">
                  {navUpdateReview.navAfterFiatDisplay}
                </Label>
              )}
            </div>

            <div className="flex flex-col gap-0.5">
              <Label variant="tag" className="text-bg-0">
                NAV change
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Span>
                  {navDeltaAmountDisplay} {RBTC}
                  {navUpdateReview.navDeltaPctDisplay
                    ? ` (${navUpdateReview.navDeltaPctDisplay} vs current NAV)`
                    : navUpdateReview.navBeforeWei === 0n
                      ? ' (percentage N/A when prior NAV was zero)'
                      : ''}
                </Span>
              </div>
            </div>

            <div className="flex flex-col gap-0.5 col-span-full">
              <Label variant="tag" className="text-bg-0">
                Reported off-chain change
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                <Span>
                  {navUpdateReview.reportedDeltaDisplay} {RBTC}
                </Span>
              </div>
            </div>
          </>
        )}
      </div>

      {reportedOffchainWarnings.length > 0 && (
        <div className="flex flex-col gap-2" data-testid="reported-offchain-warnings">
          {reportedOffchainWarnings.map(warning => (
            <div key={warning} className="flex items-start gap-2 py-3 px-4 rounded-sm bg-st-info/20">
              <Image
                src="/images/warning-icon.svg"
                alt="Warning"
                width={24}
                height={24}
                className="shrink-0 mt-0.5"
              />
              <Label variant="body-s" className="text-st-info wrap-break-word">
                {warning}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
