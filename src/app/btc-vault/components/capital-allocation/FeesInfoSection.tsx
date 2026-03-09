'use client'

import { BalanceInfo } from '@/components/BalanceInfo'
import { Header } from '@/components/Typography'

import { FEES_INFO_PLACEHOLDER, FEES_INFO_TOOLTIP_MAP } from './CapitalAllocationSection.constants'

/**
 * Displays deposit, redemption, annual management, and performance fees.
 * Renders inside the Capital Allocation section of the BTC Vault.
 */
export function FeesInfoSection() {
  return (
    <div data-testid="capital-allocation-fees-info" className="flex flex-col gap-4">
      <Header variant="h4" className="text-text-100">
        FEES INFO
      </Header>
      <div className="flex flex-wrap gap-4 md:gap-0">
        <div className="flex min-w-0 shrink-0 basis-full items-center gap-4 md:basis-1/4">
          <BalanceInfo
            className="w-full min-w-0 md:max-w-[224px]"
            title="Deposit fee"
            amount={FEES_INFO_PLACEHOLDER.depositFee}
            tooltipContent={FEES_INFO_TOOLTIP_MAP.depositFee}
            data-testid="fee-deposit"
          />
        </div>
        <div className="flex min-w-0 shrink-0 basis-full items-center gap-4 md:basis-1/4">
          <BalanceInfo
            className="w-full min-w-0 md:max-w-[224px]"
            title="Redemption fee"
            amount={FEES_INFO_PLACEHOLDER.redemptionFee}
            tooltipContent={FEES_INFO_TOOLTIP_MAP.redemptionFee}
            data-testid="fee-redemption"
          />
        </div>
        <div className="flex min-w-0 shrink-0 basis-full items-center gap-4 md:basis-1/4">
          <BalanceInfo
            className="w-full min-w-0 md:max-w-[224px]"
            title="Annual management fee"
            amount={FEES_INFO_PLACEHOLDER.annualManagementFee}
            tooltipContent={FEES_INFO_TOOLTIP_MAP.annualManagementFee}
            data-testid="fee-annual-management"
          />
        </div>
        <div className="flex min-w-0 shrink-0 basis-full items-center gap-4 md:basis-1/4">
          <BalanceInfo
            className="w-full min-w-0 md:max-w-[224px]"
            title="Performance fee"
            amount={FEES_INFO_PLACEHOLDER.performanceFee}
            tooltipContent={FEES_INFO_TOOLTIP_MAP.performanceFee}
            data-testid="fee-performance"
          />
        </div>
      </div>
    </div>
  )
}
