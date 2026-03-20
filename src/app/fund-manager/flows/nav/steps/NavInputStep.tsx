'use client'

import { useCallback, useEffect } from 'react'

import { TokenImage } from '@/components/TokenImage'
import { Label, Span } from '@/components/Typography'
import { RBTC } from '@/lib/constants'
import { formatNumberWithCommas } from '@/lib/utils'
import { executeTxFlow } from '@/shared/notification'

import { SimpleAmountInputSection } from '../../../components/SimpleAmountInputSection'
import { FlowStepProps } from '../../../types'
import { useUpdateNav } from '../hooks/useUpdateNav'
import { useUpdateNavContext } from '../UpdateNavContext'

export const NavInputStep = ({ onCloseModal, setButtonActions }: FlowStepProps) => {
  const {
    navAmount,
    usdEquivalent,
    isValidAmount,
    errorMessage,
    currentNav,
    effectiveOnDisplay,
    reportedOffchainWei,
    vaultReadsLoading,
    handleNavAmountChange,
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

  const currentNavAmountDisplay = formatNumberWithCommas(currentNav.amount)

  return (
    <div className="flex flex-col gap-8">
      <SimpleAmountInputSection
        title="Enter new NAV"
        amount={navAmount}
        onAmountChange={handleNavAmountChange}
        usdEquivalent={usdEquivalent}
        errorMessage={errorMessage}
        tokenSymbol={RBTC}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-2 gap-y-6 w-full">
        {/* TODO(TOK-1183): effective on — wire real data source */}
        <div className="flex flex-col gap-0.5">
          <Label variant="tag" className="text-bg-0">
            Effective on
          </Label>
          <Span>{effectiveOnDisplay}</Span>
        </div>
        <div className="flex flex-col gap-0.5 sm:col-span-2">
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
      </div>
    </div>
  )
}
