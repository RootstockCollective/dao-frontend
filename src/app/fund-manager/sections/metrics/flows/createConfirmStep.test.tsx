import { render, within } from '@testing-library/react'
import { Hash } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { AmountFlowContextValue } from './createAmountFlowContext'
import { createConfirmStep } from './createConfirmStep'

// Mock dependencies before imports
vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}))

vi.mock('@/components/TokenImage', () => ({
  TokenImage: () => <span data-testid="TokenImage" />,
}))

vi.mock('@/shared/notification', () => ({
  executeTxFlow: vi.fn(),
}))

const RECIPIENT_ADDRESS = '0x1234567890123456789012345678901234567890' as const

const createMockTransaction = (
  overrides: {
    onRequestTransaction?: () => Promise<Hash>
    isRequesting?: boolean
    isTxPending?: boolean
  } = {},
) => ({
  onRequestTransaction: vi.fn().mockResolvedValue('0xtxhash' as Hash),
  isRequesting: false,
  isTxPending: false,
  ...overrides,
})

const createMockContext = (overrides: Partial<AmountFlowContextValue> = {}): AmountFlowContextValue => ({
  amount: '1',
  isValidAmount: true,
  isAmountOverBalance: false,
  errorMessage: '',
  usdEquivalent: '$50,000.00',
  selectedToken: RBTC,
  balance: 2_000_000_000_000_000_000n,
  balanceFormatted: '2.0',
  isNative: true,
  requiresAllowance: false,
  setAmount: vi.fn(),
  handleAmountChange: vi.fn(),
  handlePercentageClick: vi.fn(),
  setSelectedToken: vi.fn(),
  ...overrides,
})

const defaultProps = {
  onGoNext: vi.fn(),
  onGoBack: vi.fn(),
  onGoToStep: vi.fn(),
  onCloseModal: vi.fn(),
  setButtonActions: vi.fn(),
}

describe('createConfirmStep', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('component creation', () => {
    it('creates a component that can be rendered', () => {
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext(),
        useTransaction: () => createMockTransaction(),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })
      const { container } = render(<ConfirmStep {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('rendering', () => {
    it('renders recipient address', () => {
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext(),
        useTransaction: () => createMockTransaction(),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })
      const { container } = render(<ConfirmStep {...defaultProps} />)
      // shortAddress uses ellipsis character … not three dots ...
      expect(within(container).getByText('0x123456…567890')).toBeInTheDocument()
    })
  })

  describe('button actions', () => {
    it('disables Sign button when amount is empty', () => {
      const setButtonActions = vi.fn()
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext({ amount: '' }),
        useTransaction: () => createMockTransaction(),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })

      render(<ConfirmStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            disabled: true,
          }),
        }),
      )
    })

    it('disables Sign button when amount is 0', () => {
      const setButtonActions = vi.fn()
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext({ amount: '0' }),
        useTransaction: () => createMockTransaction(),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })

      render(<ConfirmStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            disabled: true,
          }),
        }),
      )
    })

    it('enables Sign button when amount is valid', () => {
      const setButtonActions = vi.fn()
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext({ amount: '1' }),
        useTransaction: () => createMockTransaction(),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })

      render(<ConfirmStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Sign & propose transaction',
            disabled: false,
          }),
        }),
      )
    })

    it('shows Signing... when isRequesting is true', () => {
      const setButtonActions = vi.fn()
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext({ amount: '1' }),
        useTransaction: () => createMockTransaction({ isRequesting: true }),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })

      render(<ConfirmStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Signing...',
            loading: true,
          }),
        }),
      )
    })

    it('shows Back button with correct onClick for native token', () => {
      const onGoToStep = vi.fn()
      const setButtonActions = vi.fn()
      const ConfirmStep = createConfirmStep({
        useFlowContext: () => createMockContext({ amount: '1', isNative: true }),
        useTransaction: () => createMockTransaction(),
        actionName: 'vaultDeposit',
        getRecipientAddress: () => RECIPIENT_ADDRESS,
      })

      render(<ConfirmStep {...defaultProps} onGoToStep={onGoToStep} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          secondary: expect.objectContaining({
            label: 'Back',
          }),
        }),
      )
    })
  })
})
