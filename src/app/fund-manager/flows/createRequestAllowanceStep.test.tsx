import { render } from '@testing-library/react'
import { Hash } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AmountFlowContextValue } from './createAmountFlowContext'
import { createRequestAllowanceStep } from './createRequestAllowanceStep'

// Mock dependencies before imports
vi.mock('@/components/TokenImage', () => ({
  TokenImage: () => <span data-testid="TokenImage" />,
}))

vi.mock('@/shared/notification', () => ({
  executeTxFlow: vi.fn(),
}))

vi.mock('@/app/fund-manager/hooks/useErc20Allowance', () => ({
  useErc20Allowance: vi.fn(),
}))

const SPENDER_ADDRESS = '0x1234567890123456789012345678901234567890' as const
const CONTRACT_LABEL = 'Vault Contract'

const createMockContext = (overrides: Partial<AmountFlowContextValue> = {}): AmountFlowContextValue => ({
  amount: '1',
  isValidAmount: true,
  isAmountOverBalance: false,
  errorMessage: '',
  usdEquivalent: '$50,000.00',
  selectedToken: 'WrBTC',
  balance: 1_000_000_000_000_000_000n,
  balanceFormatted: '1.0',
  isNative: false,
  requiresAllowance: true,
  setAmount: vi.fn(),
  handleAmountChange: vi.fn(),
  handlePercentageClick: vi.fn(),
  setSelectedToken: vi.fn(),
  ...overrides,
})

const createMockAllowance = (overrides = {}) => ({
  isAllowanceEnough: false,
  isAllowanceReadLoading: false,
  isRequesting: false,
  isTxPending: false,
  isTxFailed: false,
  allowanceTxHash: undefined as Hash | undefined,
  onRequestAllowance: vi.fn().mockResolvedValue('0xtxhash' as Hash),
  ...overrides,
})

const defaultProps = {
  onGoNext: vi.fn(),
  onGoBack: vi.fn(),
  onGoToStep: vi.fn(),
  onCloseModal: vi.fn(),
  setButtonActions: vi.fn(),
}

describe('createRequestAllowanceStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('component creation', () => {
    it('creates a component that can be rendered', async () => {
      const { useErc20Allowance } = await import('@/app/fund-manager/hooks/useErc20Allowance')
      ;(useErc20Allowance as ReturnType<typeof vi.fn>).mockReturnValue(createMockAllowance())

      const RequestAllowanceStep = createRequestAllowanceStep({
        spenderAddress: SPENDER_ADDRESS,
        contractLabel: CONTRACT_LABEL,
        useFlowContext: () => createMockContext(),
      })

      const { container } = render(<RequestAllowanceStep {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('button actions', () => {
    it('disables Request allowance button when isLoading', async () => {
      const { useErc20Allowance } = await import('@/app/fund-manager/hooks/useErc20Allowance')
      ;(useErc20Allowance as ReturnType<typeof vi.fn>).mockReturnValue(
        createMockAllowance({ isAllowanceReadLoading: true }),
      )

      const setButtonActions = vi.fn()
      const RequestAllowanceStep = createRequestAllowanceStep({
        spenderAddress: SPENDER_ADDRESS,
        contractLabel: CONTRACT_LABEL,
        useFlowContext: () => createMockContext(),
      })

      render(<RequestAllowanceStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            disabled: true,
          }),
        }),
      )
    })

    it('disables Request allowance button when amount is invalid', async () => {
      const { useErc20Allowance } = await import('@/app/fund-manager/hooks/useErc20Allowance')
      ;(useErc20Allowance as ReturnType<typeof vi.fn>).mockReturnValue(createMockAllowance())

      const setButtonActions = vi.fn()
      const RequestAllowanceStep = createRequestAllowanceStep({
        spenderAddress: SPENDER_ADDRESS,
        contractLabel: CONTRACT_LABEL,
        useFlowContext: () => createMockContext({ isValidAmount: false }),
      })

      render(<RequestAllowanceStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            disabled: true,
          }),
        }),
      )
    })

    it('enables Request allowance button when not loading and amount is valid', async () => {
      const { useErc20Allowance } = await import('@/app/fund-manager/hooks/useErc20Allowance')
      ;(useErc20Allowance as ReturnType<typeof vi.fn>).mockReturnValue(createMockAllowance())

      const setButtonActions = vi.fn()
      const RequestAllowanceStep = createRequestAllowanceStep({
        spenderAddress: SPENDER_ADDRESS,
        contractLabel: CONTRACT_LABEL,
        useFlowContext: () => createMockContext(),
      })

      render(<RequestAllowanceStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Request allowance',
            disabled: false,
          }),
        }),
      )
    })

    it('shows Requesting... when isRequesting', async () => {
      const { useErc20Allowance } = await import('@/app/fund-manager/hooks/useErc20Allowance')
      ;(useErc20Allowance as ReturnType<typeof vi.fn>).mockReturnValue(
        createMockAllowance({ isRequesting: true }),
      )

      const setButtonActions = vi.fn()
      const RequestAllowanceStep = createRequestAllowanceStep({
        spenderAddress: SPENDER_ADDRESS,
        contractLabel: CONTRACT_LABEL,
        useFlowContext: () => createMockContext(),
      })

      render(<RequestAllowanceStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Requesting...',
            loading: true,
          }),
        }),
      )
    })

    it('shows Back button with correct onClick', async () => {
      const { useErc20Allowance } = await import('@/app/fund-manager/hooks/useErc20Allowance')
      ;(useErc20Allowance as ReturnType<typeof vi.fn>).mockReturnValue(createMockAllowance())

      const onGoBack = vi.fn()
      const setButtonActions = vi.fn()
      const RequestAllowanceStep = createRequestAllowanceStep({
        spenderAddress: SPENDER_ADDRESS,
        contractLabel: CONTRACT_LABEL,
        useFlowContext: () => createMockContext(),
      })

      render(
        <RequestAllowanceStep {...defaultProps} onGoBack={onGoBack} setButtonActions={setButtonActions} />,
      )

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          secondary: expect.objectContaining({
            label: 'Back',
            onClick: onGoBack,
          }),
        }),
      )
    })
  })
})
