import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'

import { RIF, USDRIF, USDT0 } from '@/lib/constants'
import {
  useSwapInput,
  useTokenAllowance,
  useTokenSelection,
  useSwapTokens,
} from '@/shared/stores/swap'

import { SwapStepOne } from './SwapStepOne'

vi.mock('@/shared/stores/swap', () => ({
  useSwapInput: vi.fn(),
  useTokenSelection: vi.fn(),
  useTokenAllowance: vi.fn(),
  useSwapTokens: vi.fn(),
}))

const swapTokensRecord = {
  [USDT0]: {
    symbol: USDT0,
    address: '0x779Ded0c9e1022225f8E0630b35a9b54bE713736',
    name: USDT0,
    decimals: 6,
  },
  [USDRIF]: {
    symbol: USDRIF,
    address: '0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37',
    name: USDRIF,
    decimals: 18,
  },
  [RIF]: {
    symbol: RIF,
    address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
    name: RIF,
    decimals: 18,
  },
} as const

vi.mock('@/app/user/Balances/context/BalancesContext', () => ({
  useBalancesContext: () => ({
    balances: {
      [RIF]: { balance: '10' },
      [USDRIF]: { balance: '0' },
    },
    prices: { [RIF]: { price: 0.1 }, [USDRIF]: { price: 1 } },
  }),
}))

vi.mock('@/shared/notification', () => ({
  useExecuteTxFlow: () => ({ execute: vi.fn(), isExecuting: false }),
}))

const multihopQuote = {
  amountOut: 1n,
  gasEstimate: 0n,
  feeTier: 100,
  timestamp: Date.now(),
  hopFees: [100, 3000] as const,
}

const defaultSwapInput = {
  amountIn: '1',
  amountOut: '0.96',
  setAmountIn: vi.fn(),
  setAmountOut: vi.fn(),
  isQuoting: false,
  isQuoteExpired: false,
  quoteError: null,
  quote: multihopQuote,
  mode: 'exactIn' as const,
  selectedFeeTier: null,
  setSelectedFeeTier: vi.fn(),
  activeFeeTier: 100,
  availableFeeTiers: [100, 500, 3000, 10000],
}

const defaultTokenSelection = {
  tokenIn: RIF,
  tokenOut: USDRIF,
  tokenInData: {
    symbol: RIF,
    address: '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5',
    name: 'RIF',
    decimals: 18,
  },
  tokenOutData: {
    symbol: USDRIF,
    address: '0x3a15461d8ae0f0fb5fa2629e9da7d66a794a6e37',
    name: 'USDRIF',
    decimals: 18,
  },
  toggleTokenSelection: vi.fn(),
  setTokenIn: vi.fn(),
  setTokenOut: vi.fn(),
}

const defaultAllowance = {
  allowance: 10n ** 22n,
  hasSufficientAllowance: (_required: bigint) => true,
  approve: vi.fn(),
  refetchAllowance: vi.fn(),
  isCheckingAllowance: false,
  isFetchingAllowance: false,
  isApproving: false,
  tokenAddress: defaultTokenSelection.tokenInData.address as `0x${string}`,
}

function renderStepOne() {
  return render(
    <SwapStepOne
      onGoNext={vi.fn()}
      onGoBack={vi.fn()}
      onCloseModal={vi.fn()}
      onGoToStep={vi.fn()}
      setButtonActions={vi.fn()}
    />,
  )
}

describe('SwapStepOne', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSwapInput).mockReturnValue(defaultSwapInput as ReturnType<typeof useSwapInput>)
    vi.mocked(useTokenSelection).mockReturnValue(
      defaultTokenSelection as ReturnType<typeof useTokenSelection>,
    )
    vi.mocked(useTokenAllowance).mockReturnValue(
      defaultAllowance as ReturnType<typeof useTokenAllowance>,
    )
    vi.mocked(useSwapTokens).mockReturnValue({
      tokens: swapTokensRecord,
    } as ReturnType<typeof useSwapTokens>)
  })

  it('renders token dropdowns for from/to when the flow exposes multiple assets', () => {
    renderStepOne()
    expect(screen.getAllByTestId('dropdown-trigger')).toHaveLength(2)
  })

  it('renders one Pool fee / Auto control for multihop RIF↔USDRIF (no second hop picker)', () => {
    renderStepOne()

    expect(screen.getByTestId('swap-fee-tier-buttons')).toBeInTheDocument()
    expect(screen.getByTestId('fee-tier-auto')).toBeInTheDocument()
    expect(document.querySelectorAll('[data-testid="swap-fee-tier-buttons"]')).toHaveLength(1)
  })

  it('shows USDT0 bridge hint when the quote has multiple hops', () => {
    renderStepOne()
    expect(screen.getByTestId('swap-route-bridge-hint')).toHaveTextContent('Route includes USDT0')
  })

  it('hides USDT0 bridge hint for single-hop quotes', () => {
    vi.mocked(useSwapInput).mockReturnValue({
      ...defaultSwapInput,
      quote: { ...multihopQuote, hopFees: [500] },
    } as ReturnType<typeof useSwapInput>)

    renderStepOne()
    expect(screen.queryByTestId('swap-route-bridge-hint')).not.toBeInTheDocument()
  })
})
