import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { AbiWithBoost } from './AbiWithBoost'

const mockIsBoosted = vi.fn<() => boolean>()

vi.mock('../hooks/useBackingBoostChange', () => ({
  useIsBackingBoosted: () => mockIsBoosted(),
}))

afterEach(cleanup)

const SUFFIX = <span> % (estimated)</span>

describe('AbiWithBoost', () => {
  it('adds the boost to the ABI the figure shows once the backing is boosted, keeping its suffix', () => {
    mockIsBoosted.mockReturnValue(true)
    const { container } = render(<AbiWithBoost abi={Big(9)} suffix={SUFFIX} />)
    // The backer's own 9% plus 7.5%, not the Collective's ABI plus 7.5%
    expect(screen.getByTestId('AbiWithBoost').textContent).toBe('16.5')
    expect(container.textContent).toBe('16.5 % (estimated)')
  })

  it('shows the figure unchanged otherwise', () => {
    mockIsBoosted.mockReturnValue(false)
    const { container } = render(<AbiWithBoost abi={Big(9)} suffix={SUFFIX} />)
    expect(container.textContent).toBe('9 % (estimated)')
    expect(screen.queryByTestId('AbiWithBoost')).toBeNull()
  })
})
