import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { DelegatesContainer } from './DelegatesContainer'

const { DENIED, DOMAIN, SLOW, resolveSlow } = vi.hoisted(() => {
  let resolveSlow: (address: string) => void = () => {}
  return {
    DENIED: '0x17296956b4E07Ff8931E4fF4EA06709fAb70B879',
    DOMAIN: 'curia.rsk',
    SLOW: new Promise<string>(resolve => {
      resolveSlow = resolve
    }),
    resolveSlow: (address: string) => resolveSlow(address),
  }
})

vi.mock('wagmi', () => ({ useReadContract: () => ({ data: undefined }) }))
vi.mock('@/app/user/Delegation/hooks/useNftHoldersWithVotingPower', () => ({
  useNftHoldersWithVotingPower: () => ({ nftHolders: [] }),
}))
vi.mock('@/lib/constants', async importOriginal => ({
  ...(await importOriginal<object>()),
  DELEGATES_DENYLIST: [DENIED.toLowerCase(), DOMAIN],
}))
vi.mock('@/lib/rns', () => ({
  resolveRnsDomain: (domain: string) => {
    if (domain === 'slow.rsk') return SLOW
    return Promise.resolve(domain === 'alias.rsk' ? DENIED : '0x' + '1'.repeat(40))
  },
}))

const typeDelegate = async (value: string) => {
  const onDelegate = vi.fn()
  render(<DelegatesContainer didIDelegateToMyself onDelegate={onDelegate} />)
  fireEvent.change(screen.getByTestId('delegateInput'), { target: { value } })
  await act(() => vi.advanceTimersByTimeAsync(1000))
  return onDelegate
}

describe('DelegatesContainer denylist', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('rejects a denied address', async () => {
    const onDelegate = await typeDelegate(DENIED)

    expect(screen.getByText('Error: This delegate is no longer active')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delegateButton'))
    expect(onDelegate).not.toHaveBeenCalled()
  })

  it('rejects a denied RNS domain without resolving it', async () => {
    await typeDelegate(DOMAIN)

    expect(screen.getByText('Error: This delegate is no longer active')).toBeInTheDocument()
  })

  it('rejects any other domain that resolves to a denied address', async () => {
    await typeDelegate('alias.rsk')

    expect(screen.getByText('Error: This delegate is no longer active')).toBeInTheDocument()
  })

  it('still accepts a domain that resolves elsewhere', async () => {
    await typeDelegate('puddii.rsk')

    expect(screen.getByText(/RNS Valid!/)).toBeInTheDocument()
  })

  it('ignores an RNS lookup that finishes after the input was replaced', async () => {
    const typed = '0x' + '2'.repeat(40)
    const stale = '0x' + '3'.repeat(40)
    const onDelegate = await typeDelegate('slow.rsk')
    expect(screen.getByText('Validating...')).toBeInTheDocument()

    fireEvent.change(screen.getByTestId('delegateInput'), { target: { value: typed } })
    await act(() => vi.advanceTimersByTimeAsync(1000))
    resolveSlow(stale)
    await act(() => vi.advanceTimersByTimeAsync(0))

    expect(screen.queryByText(/RNS Valid!/)).not.toBeInTheDocument()
    expect(screen.queryByText(new RegExp(stale, 'i'))).not.toBeInTheDocument()
    fireEvent.click(screen.getByTestId('delegateButton'))
    expect(onDelegate).toHaveBeenCalledWith(typed, '')
  })
})
