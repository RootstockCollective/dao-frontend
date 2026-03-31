import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { RBTC } from '@/lib/constants'

import { AmountFlowContextValue } from './createAmountFlowContext'
import { createDepositAmountStep } from './createDepositAmountStep'

// Mock all dependencies
vi.mock('@/components/CopyButton', () => ({
  CopyButton: ({ children }: { children: React.ReactNode }) => (
    <button data-testid="CopyButton">{children}</button>
  ),
}))

vi.mock('@/components/Icons', () => ({
  BiCopyIcon: () => <span data-testid="BiCopyIcon" />,
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
  PercentageButtons: ({
    onPercentageClick,
    testId,
  }: {
    onPercentageClick: (pct: number) => void
    testId: string
  }) => (
    <div data-testid={testId}>
      <button onClick={() => onPercentageClick(0.1)} data-testid="10Button">
        10%
      </button>
      <button onClick={() => onPercentageClick(0.5)} data-testid="50Button">
        50%
      </button>
      <button onClick={() => onPercentageClick(1)} data-testid="MaxButton">
        Max
      </button>
    </div>
  ),
}))

vi.mock('@/components/TokenImage', () => ({
  TokenImage: () => <span data-testid="TokenImage" />,
}))

vi.mock('@/components/SingleSelectDropdown/SingleSelectDropdown', () => ({
  Dropdown: ({ children }: { children: React.ReactNode }) => <div data-testid="Dropdown">{children}</div>,
  DropdownTrigger: ({
    children,
    'data-testid': testId,
  }: {
    children: React.ReactNode
    'data-testid': string
  }) => <button data-testid={testId}>{children}</button>,
  DropdownContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`item-${value}`}>{children}</div>
  ),
  DropdownValue: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}))

const CONTRACT_ADDRESS = '0x1234567890123456789012345678901234567890' as const
const ADDRESS_LABEL = 'Vault address'

const createMockContext = (overrides: Partial<AmountFlowContextValue> = {}): AmountFlowContextValue => ({
  amount: '',
  isValidAmount: false,
  isAmountOverBalance: false,
  errorMessage: '',
  usdEquivalent: '',
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

describe('createDepositAmountStep', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('component creation', () => {
    it('creates a component that can be rendered', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext(),
      })
      const { container } = render(<DepositAmountStep {...defaultProps} />)
      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('rendering', () => {
    it('renders contract address label', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext(),
      })
      const { container } = render(<DepositAmountStep {...defaultProps} />)
      expect(within(container).getByText(ADDRESS_LABEL)).toBeInTheDocument()
    })

    it('renders shortened contract address', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext(),
      })
      const { container } = render(<DepositAmountStep {...defaultProps} />)
      // The shortAddress function with amount=6 gives 0x123456...567890
      expect(within(container).getByText('0x123456…567890')).toBeInTheDocument()
    })

    it('renders AmountInputSection', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext({ balanceFormatted: '2.0' }),
      })
      const { container } = render(<DepositAmountStep {...defaultProps} />)
      expect(within(container).getByTestId('AmountInputSection')).toBeInTheDocument()
    })

    it('renders AmountInputSection with WalletBalanceLabel', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext(),
      })
      const { container } = render(<DepositAmountStep {...defaultProps} />)
      expect(within(container).getByTestId('WalletBalanceLabel')).toBeInTheDocument()
    })
  })

  describe('button actions', () => {
    it('disables Continue button when amount is invalid', () => {
      const setButtonActions = vi.fn()
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext({ isValidAmount: false, amount: '' }),
      })

      render(<DepositAmountStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Continue',
            disabled: true,
          }),
        }),
      )
    })

    it('enables Continue button when amount is valid', () => {
      const setButtonActions = vi.fn()
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext({ isValidAmount: true, amount: '1' }),
      })

      render(<DepositAmountStep {...defaultProps} setButtonActions={setButtonActions} />)

      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Continue',
            disabled: false,
          }),
        }),
      )
    })
  })

  describe('user interactions', () => {
    it('sets Continue button action with onGoNext when amount is valid', () => {
      const onGoNext = vi.fn()
      const setButtonActions = vi.fn()
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext({ isValidAmount: true, amount: '1' }),
      })

      render(<DepositAmountStep {...defaultProps} onGoNext={onGoNext} setButtonActions={setButtonActions} />)

      // Verify setButtonActions was called with Continue that has onClick = onGoNext
      expect(setButtonActions).toHaveBeenCalledWith(
        expect.objectContaining({
          primary: expect.objectContaining({
            label: 'Continue',
            disabled: false,
            onClick: onGoNext,
          }),
        }),
      )
    })

    it('renders error message when amount is over balance', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () =>
          createMockContext({
            isAmountOverBalance: true,
            errorMessage: 'This is more than the available balance. Please update the amount.',
          }),
      })

      const { container } = render(<DepositAmountStep {...defaultProps} />)
      expect(
        within(container).getByText('This is more than the available balance. Please update the amount.'),
      ).toBeInTheDocument()
    })

    it('calls handlePercentageClick when 50% button is clicked', async () => {
      const handlePercentageClick = vi.fn()
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext({ handlePercentageClick }),
      })

      const { container } = render(<DepositAmountStep {...defaultProps} />)
      await userEvent.click(within(container).getByTestId('50Button'))
      expect(handlePercentageClick).toHaveBeenCalledWith(0.5)
    })

    it('renders token selector', () => {
      const DepositAmountStep = createDepositAmountStep({
        contractAddress: CONTRACT_ADDRESS,
        addressLabel: ADDRESS_LABEL,
        useFlowContext: () => createMockContext({ selectedToken: RBTC }),
      })

      const { container } = render(<DepositAmountStep {...defaultProps} />)
      expect(within(container).getByTestId('TokenSelector')).toBeInTheDocument()
    })
  })
})
