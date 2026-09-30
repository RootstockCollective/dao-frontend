import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StakingProvider } from '../StakingContext'
import { StakingToken } from '../types'
import { StepWrapper } from './StepWrapper'

const mockIsAbiBoostEnabled = vi.fn<() => boolean>()

vi.mock('@/app/collective-rewards/abi-boost/hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => mockIsAbiBoostEnabled(),
}))

vi.mock('@/shared/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true,
}))

// A single step standing in for the first one: no help today, and a boost-specific description
vi.mock('../Steps/stepConfig', () => ({
  stepConfig: [
    {
      component: () => <div data-testid="StepContent" />,
      description: 'Plain description',
      boostDescription: 'Boost description',
      progress: 28,
    },
  ],
}))

const token = (symbol: string): StakingToken => ({ balance: '100', symbol, price: '1', contract: '0x0' })

const renderWrapper = () =>
  render(
    <StakingProvider tokenToSend={token('RIF')} tokenToReceive={token('stRIF')}>
      <StepWrapper onCloseModal={vi.fn()} />
    </StakingProvider>,
  )

beforeEach(() => {
  mockIsAbiBoostEnabled.mockReturnValue(false)
  // The progress bar measures itself; jsdom has no ResizeObserver
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('StepWrapper', () => {
  it('keeps the regular description and no help on the first step without the flag', () => {
    renderWrapper()
    expect(screen.getByText('Plain description')).toBeDefined()
    expect(screen.queryByText("Help, I don't understand")).toBeNull()
  })

  it('uses the boost description and offers help on every step with the flag', () => {
    mockIsAbiBoostEnabled.mockReturnValue(true)
    renderWrapper()
    expect(screen.getByText('Boost description')).toBeDefined()
    expect(screen.getByText("Help, I don't understand")).toBeDefined()
  })
})
