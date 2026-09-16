import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { AmountInputSection } from './AmountInputSection'

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img alt={alt} src="" />,
}))

vi.mock('@/components/Input', () => ({
  Input: ({
    value,
    onChange,
    'data-testid': testId,
  }: {
    value: string
    onChange: () => void
    'data-testid': string
  }) => <input data-testid={testId} value={value} onChange={onChange} />,
}))

vi.mock('@/components/PercentageButtons', () => ({
  PercentageButtons: () => <div data-testid="PercentageButtons" />,
}))

vi.mock('@/components/TokenImage', () => ({
  TokenImage: () => <span data-testid="TokenImage" />,
}))

const baseProps = {
  title: 'Enter amount to transfer',
  amount: '',
  balanceFormatted: '2.0',
  tokenSymbol: RBTC,
  onAmountChange: vi.fn(),
  onPercentageClick: vi.fn(),
}

describe('AmountInputSection', () => {
  afterEach(() => cleanup())

  it('renders max depositable label when maxDepositableFormatted is set', () => {
    render(<AmountInputSection {...baseProps} maxDepositableFormatted="0.75" />)
    const maxLabel = screen.getByTestId('MaxDepositableLabel')
    expect(maxLabel).toHaveTextContent('Max:')
    expect(maxLabel).toHaveTextContent('0.75')
    expect(maxLabel).toHaveTextContent(RBTC)
  })

  it('does not render max depositable label when maxDepositableFormatted is omitted', () => {
    render(<AmountInputSection {...baseProps} />)
    expect(screen.queryByTestId('MaxDepositableLabel')).not.toBeInTheDocument()
  })
})
