import { describe, expect, it } from 'vitest'
import { parseEther } from 'viem'

import {
  reportedOffchainWarningMessages,
  stepChangeMinMultipleDisplay,
  type ReportedOffchainWarningContext,
} from './reportedOffchainWarnings'

function baseFmt(): ReportedOffchainWarningContext['fmt'] {
  return {
    navBefore: '9.39',
    navAfter: '15.39',
    navDelta: '6',
    navDeltaPct: '63.9%',
    currentReported: '0',
    newReported: '6',
    reportedDelta: '6',
    pctNewReportedOfNavBefore: '63.9%',
  }
}

function makeCtx(
  overrides: Partial<ReportedOffchainWarningContext> & {
    fmt?: Partial<ReportedOffchainWarningContext['fmt']>
  },
): ReportedOffchainWarningContext {
  const { fmt: fmtOverrides, ...rest } = overrides
  const fmt = { ...baseFmt(), ...fmtOverrides }
  return {
    reportedWei: 60n,
    currentReportedWei: 0n,
    currentTotalAssetsWei: 100n,
    isFirstNonZeroReport: true,
    fmt,
    ...rest,
  }
}

describe('reportedOffchainWarningMessages', () => {
  it('warns when reported exceeds half of NAV', () => {
    const ctx = makeCtx({
      reportedWei: 60n,
      currentReportedWei: 0n,
      currentTotalAssetsWei: 100n,
      isFirstNonZeroReport: true,
      fmt: {
        ...baseFmt(),
        navBefore: '100',
        newReported: '60',
        pctNewReportedOfNavBefore: '60.0%',
      },
    })
    const msgs = reportedOffchainWarningMessages(ctx)
    expect(msgs.some((m) => m.includes('63.9%') || m.includes('60.0%'))).toBe(true)
    expect(msgs.some((m) => m.includes('of current NAV ('))).toBe(true)
  })

  it('does not warn on small reported vs NAV', () => {
    const ctx = makeCtx({
      reportedWei: 10n,
      currentReportedWei: 0n,
      currentTotalAssetsWei: 100n,
      isFirstNonZeroReport: false,
      fmt: { ...baseFmt(), newReported: '10', pctNewReportedOfNavBefore: '10.0%' },
    })
    expect(reportedOffchainWarningMessages(ctx)).toHaveLength(0)
  })

  it('warns on at least 3× change when both sides positive', () => {
    const ctx = makeCtx({
      reportedWei: 100n,
      currentReportedWei: 10n,
      currentTotalAssetsWei: 1000n,
      isFirstNonZeroReport: false,
      fmt: {
        ...baseFmt(),
        currentReported: '10',
        newReported: '100',
        navBefore: '1000',
        navAfter: '1090',
      },
    })
    const msgs = reportedOffchainWarningMessages(ctx)
    expect(msgs.some((m) => m.includes(stepChangeMinMultipleDisplay()))).toBe(true)
    expect(msgs.some((m) => m.includes('1000'))).toBe(true)
  })

  it('warns when change is exactly 3× (inclusive threshold)', () => {
    const ctx = makeCtx({
      reportedWei: 30n,
      currentReportedWei: 10n,
      isFirstNonZeroReport: false,
      fmt: { ...baseFmt(), currentReported: '10', newReported: '30' },
    })
    expect(reportedOffchainWarningMessages(ctx).some((m) => m.includes(stepChangeMinMultipleDisplay()))).toBe(
      true,
    )
  })

  it('does not warn when change is below 3×', () => {
    const ctx = makeCtx({
      reportedWei: 29n,
      currentReportedWei: 10n,
      isFirstNonZeroReport: false,
      fmt: { ...baseFmt(), currentReported: '10', newReported: '29' },
    })
    expect(reportedOffchainWarningMessages(ctx).some((m) => m.includes(stepChangeMinMultipleDisplay()))).toBe(
      false,
    )
  })

  it('warns at 3× with full wei amounts (same as UI)', () => {
    const prev = parseEther('1')
    const next = parseEther('3')
    const nav = parseEther('100')
    const ctx = makeCtx({
      reportedWei: next,
      currentReportedWei: prev,
      currentTotalAssetsWei: nav,
      isFirstNonZeroReport: false,
      fmt: {
        ...baseFmt(),
        currentReported: '1',
        newReported: '3',
        navBefore: '100',
      },
    })
    expect(reportedOffchainWarningMessages(ctx).some((m) => m.includes(stepChangeMinMultipleDisplay()))).toBe(
      true,
    )
  })

  it('does not apply step-change rule when current on-chain reported is zero', () => {
    const ctx = makeCtx({
      reportedWei: parseEther('3'),
      currentReportedWei: 0n,
      currentTotalAssetsWei: parseEther('100'),
      isFirstNonZeroReport: true,
      fmt: { ...baseFmt(), newReported: '3' },
    })
    expect(reportedOffchainWarningMessages(ctx).some((m) => m.includes(stepChangeMinMultipleDisplay()))).toBe(
      false,
    )
  })

  it('warns on first report large vs NAV when current reported is zero', () => {
    const ctx = makeCtx({
      reportedWei: 35n,
      currentReportedWei: 0n,
      currentTotalAssetsWei: 100n,
      isFirstNonZeroReport: true,
      fmt: {
        ...baseFmt(),
        navBefore: '100',
        newReported: '35',
        pctNewReportedOfNavBefore: '35.0%',
      },
    })
    const msgs = reportedOffchainWarningMessages(ctx)
    expect(msgs.some((m) => m.includes('first non-zero'))).toBe(true)
  })
})
