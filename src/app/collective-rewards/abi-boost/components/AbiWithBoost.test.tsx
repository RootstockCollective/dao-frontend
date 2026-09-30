import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { AbiWithBoost } from './AbiWithBoost'

const mockIsBoosted = vi.fn<() => boolean>()

vi.mock('../hooks/useBackingBoostChange', () => ({
  useIsBackingBoosted: () => mockIsBoosted(),
}))

afterEach(cleanup)

describe('AbiWithBoost', () => {
  it('adds the boost to the ABI the figure shows once the backing is boosted', () => {
    mockIsBoosted.mockReturnValue(true)
    render(<AbiWithBoost abi={Big(9)}>9 % (estimated)</AbiWithBoost>)
    // The backer's own 9% plus 7.5%, not the Collective's ABI plus 7.5%
    expect(screen.getByTestId('AbiWithBoost').textContent).toBe('16.5%')
  })

  it('shows the figure unchanged otherwise', () => {
    mockIsBoosted.mockReturnValue(false)
    render(<AbiWithBoost abi={Big(9)}>9 % (estimated)</AbiWithBoost>)
    expect(screen.getByText('9 % (estimated)')).toBeDefined()
    expect(screen.queryByTestId('AbiWithBoost')).toBeNull()
  })
})
