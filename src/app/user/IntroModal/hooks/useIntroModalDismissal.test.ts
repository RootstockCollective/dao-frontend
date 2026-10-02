import { cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ONE_DAY_IN_MS } from '@/lib/constants'

import { INTRO_MODAL_REMIND_AFTER_DAYS } from '../config'
import { useIntroModalDismissal } from './useIntroModalDismissal'

const mocks = vi.hoisted(() => ({ address: undefined as string | undefined }))

vi.mock('wagmi', () => ({ useAccount: () => ({ address: mocks.address }) }))

const ADDRESS = '0x00000000000000000000000000000000000000Ab'
const OTHER_ADDRESS = '0x00000000000000000000000000000000000000cd'
const NOW = new Date('2026-10-01T12:00:00Z').getTime()
const REMIND_AFTER_MS = INTRO_MODAL_REMIND_AFTER_DAYS * ONE_DAY_IN_MS

const renderDismissal = () => renderHook(() => useIntroModalDismissal()).result.current

describe('useIntroModalDismissal', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(NOW)
    mocks.address = ADDRESS
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('shows the modal to a holder who never closed it', () => {
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(false)
  })

  it('keeps a closed step closed after a reload', () => {
    renderDismissal().dismiss('NEED_RIF')

    // A fresh render reads storage again, the way a reload or a new visit to Holdings would
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(true)
  })

  it('shows the next step even though the previous one was closed', () => {
    renderDismissal().dismiss('NEED_RBTC_RIF')

    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(false)
  })

  it('keeps each step closed on its own when the holder closes another one', () => {
    // A failed balance read can show the wrong step for a moment. Closing it must not reopen the real one.
    renderDismissal().dismiss('NEED_STRIF')
    renderDismissal().dismiss('NEED_RIF')

    const { isDismissed } = renderDismissal()
    expect(isDismissed('NEED_STRIF')).toBe(true)
    expect(isDismissed('NEED_RIF')).toBe(true)
  })

  it('brings the same step back once the reminder period is over', () => {
    renderDismissal().dismiss('NEED_RIF')

    vi.setSystemTime(NOW + REMIND_AFTER_MS - 1)
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(true)

    vi.setSystemTime(NOW + REMIND_AFTER_MS)
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(false)
  })

  it('starts the reminder period over when the holder closes the modal again', () => {
    renderDismissal().dismiss('NEED_RIF')

    vi.setSystemTime(NOW + REMIND_AFTER_MS)
    renderDismissal().dismiss('NEED_RIF')

    vi.setSystemTime(NOW + REMIND_AFTER_MS + ONE_DAY_IN_MS)
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(true)
  })

  it('treats a dismissal dated in the future as expired, so a clock moved back cannot hide the modal', () => {
    vi.setSystemTime(NOW + ONE_DAY_IN_MS)
    renderDismissal().dismiss('NEED_RIF')

    vi.setSystemTime(NOW)
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(false)
  })

  it('tracks each wallet on its own, whatever the casing of the address', () => {
    renderDismissal().dismiss('NEED_RIF')

    mocks.address = ADDRESS.toLowerCase()
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(true)

    mocks.address = OTHER_ADDRESS
    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(false)
  })

  it.each([
    ['is not JSON', 'not json'],
    ['is not an object', '[1, 2]'],
    ['holds a date that is not a timestamp', '{"NEED_RIF":"yesterday"}'],
  ])('shows the modal again when the stored entry %s', (_, stored) => {
    renderDismissal().dismiss('NEED_RIF')
    localStorage.setItem(localStorage.key(0)!, stored)

    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(false)
  })

  it('replaces an unreadable entry when the holder closes the modal again', () => {
    renderDismissal().dismiss('NEED_RIF')
    localStorage.setItem(localStorage.key(0)!, 'not json')

    renderDismissal().dismiss('NEED_RIF')

    expect(renderDismissal().isDismissed('NEED_RIF')).toBe(true)
  })

  it('stores nothing without a connected wallet', () => {
    mocks.address = undefined
    const { isDismissed, dismiss } = renderDismissal()

    dismiss('NEED_RIF')

    expect(localStorage.length).toBe(0)
    expect(isDismissed('NEED_RIF')).toBe(false)
  })

  it('does not throw when the browser refuses storage', () => {
    const storage = Object.getPrototypeOf(localStorage)
    vi.spyOn(storage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })
    vi.spyOn(storage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError')
    })
    const { isDismissed, dismiss } = renderDismissal()

    expect(() => dismiss('NEED_RIF')).not.toThrow()
    expect(isDismissed('NEED_RIF')).toBe(false)
  })
})
