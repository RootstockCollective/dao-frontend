import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useIntroDismissal } from './useIntroDismissal'

const mockUseAccount = vi.fn()

vi.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}))

const ADDRESS = '0xAbC0000000000000000000000000000000000001'
const OTHER_ADDRESS = '0xdeF0000000000000000000000000000000000002'
const MAINNET = 30
const TESTNET = 31

describe('useIntroDismissal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockUseAccount.mockReturnValue({ address: ADDRESS, chainId: MAINNET })
  })

  it('reports not dismissed when nothing is stored', async () => {
    const { result } = renderHook(() => useIntroDismissal())

    await waitFor(() => expect(result.current.isDismissed).toBe(false))
  })

  it('stays null while no wallet is connected', async () => {
    mockUseAccount.mockReturnValue({ address: undefined, chainId: MAINNET })

    const { result } = renderHook(() => useIntroDismissal())

    await waitFor(() => expect(result.current.isDismissed).toBeNull())
  })

  it('reads a previously stored dismissal', async () => {
    localStorage.setItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`, 'true')

    const { result } = renderHook(() => useIntroDismissal())

    await waitFor(() => expect(result.current.isDismissed).toBe(true))
  })

  it('dismiss flips the state and persists it', async () => {
    const { result } = renderHook(() => useIntroDismissal())
    await waitFor(() => expect(result.current.isDismissed).toBe(false))

    act(() => result.current.dismiss())

    expect(result.current.isDismissed).toBe(true)
    expect(localStorage.getItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`)).toBe(
      'true',
    )
  })

  it('restore clears the state and the stored value', async () => {
    localStorage.setItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`, 'true')
    const { result } = renderHook(() => useIntroDismissal())
    await waitFor(() => expect(result.current.isDismissed).toBe(true))

    act(() => result.current.restore())

    expect(result.current.isDismissed).toBe(false)
    expect(localStorage.getItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`)).toBeNull()
  })

  describe('scoping', () => {
    it('does not leak a dismissal to another address', async () => {
      localStorage.setItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`, 'true')
      mockUseAccount.mockReturnValue({ address: OTHER_ADDRESS, chainId: MAINNET })

      const { result } = renderHook(() => useIntroDismissal())

      await waitFor(() => expect(result.current.isDismissed).toBe(false))
    })

    it('does not leak a dismissal across chains', async () => {
      localStorage.setItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`, 'true')
      mockUseAccount.mockReturnValue({ address: ADDRESS, chainId: TESTNET })

      const { result } = renderHook(() => useIntroDismissal())

      await waitFor(() => expect(result.current.isDismissed).toBe(false))
    })

    it('matches the stored key regardless of address casing', async () => {
      localStorage.setItem(`intro-onboarding-dismissed-${MAINNET}-${ADDRESS.toLowerCase()}`, 'true')
      mockUseAccount.mockReturnValue({ address: ADDRESS.toUpperCase(), chainId: MAINNET })

      const { result } = renderHook(() => useIntroDismissal())

      await waitFor(() => expect(result.current.isDismissed).toBe(true))
    })
  })

  describe('when the browser refuses storage', () => {
    it('reports not dismissed instead of throwing', async () => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('storage disabled')
      })

      const { result } = renderHook(() => useIntroDismissal())

      await waitFor(() => expect(result.current.isDismissed).toBe(false))
      getItem.mockRestore()
    })

    it('still closes the modal when dismiss cannot persist', async () => {
      const { result } = renderHook(() => useIntroDismissal())
      await waitFor(() => expect(result.current.isDismissed).toBe(false))

      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded')
      })

      act(() => result.current.dismiss())

      expect(result.current.isDismissed).toBe(true)
      setItem.mockRestore()
    })
  })
})
