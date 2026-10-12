import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockUseAccount = vi.fn(() => ({ address: undefined as string | undefined }))
const mockShowToast = vi.fn()

vi.mock('wagmi', () => ({ useAccount: () => mockUseAccount() }))

vi.mock('@/shared/notification', () => ({ showToast: (...args: unknown[]) => mockShowToast(...args) }))

vi.mock('@/components/Modal', () => ({
  Modal: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: ({ onSuccess }: { onSuccess: (token: string) => void }) => (
    <button type="button" data-testid="SolveCaptcha" onClick={() => onSuccess('test-token')}>
      solve captcha
    </button>
  ),
}))

vi.mock('@/components/Select', () => ({
  Select: ({
    options,
    value,
    onValueChange,
    'data-testid': dataTestId,
  }: {
    options: string[]
    value?: string
    onValueChange: (value: string) => void
    'data-testid'?: string
  }) => (
    <select
      data-testid={dataTestId}
      value={value ?? ''}
      onChange={event => onValueChange(event.target.value)}
    >
      <option value="">Select...</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  ),
}))

const { SupportModal } = await import('./SupportModal')

const ADDRESS = '0x1234567890abcdefABCDEF1234567890abcdef12'
const TX_HASH = `0x${'a'.repeat(64)}`

const referenceInput = () => screen.getByTestId('SupportReference') as HTMLInputElement
const referenceTypeSelect = () => screen.getByTestId('SupportReferenceType')

const fillRestOfForm = async (user: ReturnType<typeof userEvent.setup>) => {
  fireEvent.change(screen.getByTestId('SupportTopic'), { target: { value: 'Staking' } })
  await user.type(screen.getByTestId('SupportDescription'), 'My stake is not showing up anywhere.')
  await user.click(screen.getByTestId('SolveCaptcha'))
}

beforeEach(() => {
  mockUseAccount.mockReturnValue({ address: undefined })
  mockShowToast.mockClear()
  vi.stubGlobal(
    'fetch',
    vi.fn(
      async () => new Response(JSON.stringify({ success: true, ticket: 'SUP-ABCD1234' }), { status: 200 }),
    ),
  )
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('SupportModal reference field', () => {
  it('prefills the reference with the connected wallet address', () => {
    mockUseAccount.mockReturnValue({ address: ADDRESS })

    render(<SupportModal onClose={vi.fn()} />)

    expect(referenceInput().value).toBe(ADDRESS)
  })

  it('leaves the reference empty when no wallet is connected', () => {
    render(<SupportModal onClose={vi.fn()} />)

    expect(referenceInput().value).toBe('')
  })

  it('clears the prefilled address when switching to a transaction hash', async () => {
    mockUseAccount.mockReturnValue({ address: ADDRESS })
    render(<SupportModal onClose={vi.fn()} />)

    fireEvent.change(referenceTypeSelect(), { target: { value: 'Transaction hash' } })

    expect(referenceInput().value).toBe('')
  })

  it('restores the prefilled address when switching back', async () => {
    mockUseAccount.mockReturnValue({ address: ADDRESS })
    render(<SupportModal onClose={vi.fn()} />)

    fireEvent.change(referenceTypeSelect(), { target: { value: 'Transaction hash' } })
    fireEvent.change(referenceTypeSelect(), { target: { value: 'Wallet address' } })

    expect(referenceInput().value).toBe(ADDRESS)
  })

  it('caps the input at the length of the selected type', () => {
    render(<SupportModal onClose={vi.fn()} />)

    expect(referenceInput().maxLength).toBe(42)

    fireEvent.change(referenceTypeSelect(), { target: { value: 'Transaction hash' } })

    expect(referenceInput().maxLength).toBe(66)
  })

  it('falls back to the widest cap and a generic label when the type is deselected', () => {
    render(<SupportModal onClose={vi.fn()} />)

    fireEvent.change(referenceTypeSelect(), { target: { value: '' } })

    expect(referenceInput().maxLength).toBe(66)
    expect(screen.getByText('Wallet address or transaction hash', { selector: 'label' })).toBeVisible()
  })

  it('shows an error naming the selected type', async () => {
    const user = userEvent.setup()
    render(<SupportModal onClose={vi.fn()} />)

    await user.type(referenceInput(), '0xnothex')
    await fillRestOfForm(user)
    await user.click(screen.getByTestId('SupportSend'))

    expect(await screen.findByTestId('SupportReferenceError')).toHaveTextContent(
      'Enter a valid wallet address (0x followed by 40 hex characters)',
    )
  })

  it('drops the stale error when the type changes', async () => {
    const user = userEvent.setup()
    render(<SupportModal onClose={vi.fn()} />)

    await user.type(referenceInput(), '0xnothex')
    await fillRestOfForm(user)
    await user.click(screen.getByTestId('SupportSend'))
    expect(await screen.findByTestId('SupportReferenceError')).toBeInTheDocument()

    fireEvent.change(referenceTypeSelect(), { target: { value: 'Transaction hash' } })

    await waitFor(() => expect(screen.queryByTestId('SupportReferenceError')).not.toBeInTheDocument())
  })

  it('submits the reference and its type to the API', async () => {
    const user = userEvent.setup()
    render(<SupportModal onClose={vi.fn()} />)

    fireEvent.change(referenceTypeSelect(), { target: { value: 'Transaction hash' } })
    await user.type(referenceInput(), TX_HASH)
    await fillRestOfForm(user)
    await user.click(screen.getByTestId('SupportSend'))

    await waitFor(() => expect(mockShowToast).toHaveBeenCalled())
    const [, init] = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(JSON.parse(init.body)).toMatchObject({
      referenceType: 'Transaction hash',
      reference: TX_HASH,
    })
  })

  it('does not call the API when the reference is missing', async () => {
    const user = userEvent.setup()
    render(<SupportModal onClose={vi.fn()} />)

    await fillRestOfForm(user)
    await user.click(screen.getByTestId('SupportSend'))

    expect(await screen.findByTestId('SupportReferenceError')).toHaveTextContent('This field is required')
    expect(globalThis.fetch).not.toHaveBeenCalled()
  })
})
