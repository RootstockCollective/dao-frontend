import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DelegatesContainer } from './DelegatesContainer'

const mocks = vi.hoisted(() => ({ resolveRnsDomain: vi.fn() }))
vi.mock('@/lib/rns', () => ({ resolveRnsDomain: (d: string) => mocks.resolveRnsDomain(d) }))
vi.mock('@/app/user/Delegation/hooks/useNftHoldersWithVotingPower', () => ({
  useNftHoldersWithVotingPower: () => ({ nftHolders: [], totalDelegatedVotes: undefined, refetch: vi.fn() }),
}))
vi.mock('@/app/backing/components/BuilderHeader/BuilderHeader', () => ({
  BuilderHeader: ({ address }: { address: string }) => <span>{address}</span>,
}))

const ADDR = '0x00000000000000000000000000000000000000ab'

describe('DelegatesContainer stale input', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('does not delegate to an address that was cleared from the field before it was validated', async () => {
    const onDelegate = vi.fn()
    render(<DelegatesContainer hasOtherDelegatee={false} isClosable={false} onDelegate={onDelegate} />)
    const input = screen.getByTestId('delegateInput') as HTMLInputElement
    fireEvent.change(input, { target: { value: ADDR } })
    await act(() => vi.advanceTimersByTimeAsync(300))
    fireEvent.change(input, { target: { value: '' } })
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(input.value).toBe('')
    fireEvent.click(screen.getByTestId('delegateButton'))
    expect(onDelegate).not.toHaveBeenCalled()
  })

  it('does not keep validating an RNS name that was cleared from the field', async () => {
    let release: (a: string) => void = () => {}
    mocks.resolveRnsDomain.mockImplementation(() => new Promise<string>(r => (release = r)))
    render(<DelegatesContainer hasOtherDelegatee={false} isClosable={false} onDelegate={vi.fn()} />)
    const input = screen.getByTestId('delegateInput')
    fireEvent.change(input, { target: { value: 'slow.rsk' } })
    await act(() => vi.advanceTimersByTimeAsync(300))
    fireEvent.change(input, { target: { value: '' } })
    await act(() => vi.advanceTimersByTimeAsync(2000))
    release('0x00000000000000000000000000000000000000cd')
    await act(() => vi.advanceTimersByTimeAsync(0))
    expect(screen.queryByText('Validating...')).not.toBeInTheDocument()
  })

  it('does not show an error for text that was cleared from the field', async () => {
    render(<DelegatesContainer hasOtherDelegatee={false} isClosable={false} onDelegate={vi.fn()} />)
    const input = screen.getByTestId('delegateInput')
    fireEvent.change(input, { target: { value: 'garbage' } })
    await act(() => vi.advanceTimersByTimeAsync(300))
    fireEvent.change(input, { target: { value: '' } })
    await act(() => vi.advanceTimersByTimeAsync(2000))
    expect(screen.queryByText(/Error:/)).not.toBeInTheDocument()
  })
})
