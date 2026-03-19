/**
 * useKybStatus tests: query param ?kyb=none|rejected|passed drives status;
 * missing or invalid param yields default 'none'. Rejected includes rejectionReason.
 */
import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKybStatus } from './useKybStatus'

const mockGet = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (name: string) => (name === 'kyb' ? mockGet() : null),
  }),
}))

describe('useKybStatus', () => {
  beforeEach(() => {
    mockGet.mockReset()
  })

  it('returns status "none" when kyb param is missing', () => {
    mockGet.mockReturnValue(null)

    const { result } = renderHook(() => useKybStatus())

    expect(result.current).toEqual({ status: 'none' })
  })

  it('returns status "none" when kyb param is invalid', () => {
    mockGet.mockReturnValue('invalid')

    const { result } = renderHook(() => useKybStatus())

    expect(result.current).toEqual({ status: 'none' })
  })

  it('returns status "none" when ?kyb=none', () => {
    mockGet.mockReturnValue('none')

    const { result } = renderHook(() => useKybStatus())

    expect(result.current).toEqual({ status: 'none' })
  })

  it('returns status "rejected" and rejectionReason when ?kyb=rejected', () => {
    mockGet.mockReturnValue('rejected')

    const { result } = renderHook(() => useKybStatus())

    expect(result.current.status).toBe('rejected')
    expect(result.current.rejectionReason).toBeDefined()
    expect(typeof result.current.rejectionReason).toBe('string')
    expect(result.current.rejectionReason!.length).toBeGreaterThan(0)
  })

  it('returns status "passed" when ?kyb=passed', () => {
    mockGet.mockReturnValue('passed')

    const { result } = renderHook(() => useKybStatus())

    expect(result.current).toEqual({ status: 'passed' })
  })

  it('treats kyb param case-insensitively', () => {
    mockGet.mockReturnValue('PASSED')

    const { result } = renderHook(() => useKybStatus())

    expect(result.current).toEqual({ status: 'passed' })
  })
})
