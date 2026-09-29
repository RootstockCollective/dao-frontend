import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { parseEther } from 'viem'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { BoostActivatedModal, BoostEligibleModal } from './AbiBoostModals'

const mockPush = vi.fn()

vi.mock('../hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => true,
  useGoToBackBuilders: () => () => mockPush('/builders'),
}))

const BUILDERS: Record<string, string> = {
  '0x1111111111111111111111111111111111111111': 'Money On Chain',
  '0x2222222222222222222222222222222222222222': 'Boltz',
}

vi.mock('@/app/collective-rewards/user', () => ({
  useBuilderContext: () => ({
    getBuilderByAddress: (address: string) => ({ builderName: BUILDERS[address] }),
  }),
}))

vi.mock('@/app/shared/components/AnnualBackersIncentivesLoader', () => ({
  AnnualBackerIncentivesLoader: ({
    render,
  }: {
    render: (p: { data: Big; isLoading: boolean }) => ReactNode
  }) => render({ data: Big(4.5), isLoading: false }),
}))

afterEach(() => {
  cleanup()
  mockPush.mockReset()
})

describe('BoostEligibleModal', () => {
  it('explains how to switch the boost on and leads to the Builders', () => {
    const onClose = vi.fn()
    render(<BoostEligibleModal stakedAmount="100000" onClose={onClose} />)

    expect(screen.getByText("You're eligible for the boost")).toBeDefined()
    expect(document.body.textContent).toContain(
      '100,000 RIF is now stRIF. Back Builders with 100,000 stRIF or more and the +7.5% boost switches on for 12 months.',
    )

    fireEvent.click(screen.getByTestId('BoostEligibleBackBuilder'))
    expect(onClose).toHaveBeenCalled()
    expect(mockPush).toHaveBeenCalledWith('/builders')
  })
})

describe('BoostActivatedModal', () => {
  it('lists the backing per Builder and the rate computed from the current ABI', () => {
    render(
      <BoostActivatedModal
        allocations={{
          '0x1111111111111111111111111111111111111111': parseEther('101800'),
          '0x2222222222222222222222222222222222222222': 0n,
        }}
        onClose={vi.fn()}
      />,
    )

    expect(screen.getByText('Congrats, this backing has a 7.5% boost')).toBeDefined()
    expect(document.body.textContent).toContain('101,800 stRIF is now split across 1 Builder.')
    expect(screen.getByText('Money On Chain')).toBeDefined()
    expect(screen.queryByText('Boltz')).toBeNull()
    // 4.5% current ABI + 7.5% boost: follows the ABI instead of a fixed 12.5%
    expect(screen.getByTestId('CurrentAbiRate').textContent).toBe('4.5%')
    expect(screen.getByTestId('BoostedRate').textContent).toBe('12.0%')
  })
})
