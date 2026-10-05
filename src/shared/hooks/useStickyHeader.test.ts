import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { useStickyHeader } from './useStickyHeader'

const setScrollY = (y: number) => Object.defineProperty(window, 'scrollY', { value: y, configurable: true })

/** Scrolls and waits for the frame the hook handles the scroll in. */
const scrollTo = async (y: number) => {
  setScrollY(y)
  await act(async () => {
    window.dispatchEvent(new Event('scroll'))
    await new Promise(resolve => requestAnimationFrame(resolve))
  })
}

const renderStickyHeader = (isEnabled: boolean) => {
  const header = document.createElement('div')
  const hook = renderHook(props => useStickyHeader({ isEnabled: props.isEnabled, mode: 'direction-based' }), {
    initialProps: { isEnabled },
  })
  hook.result.current.headerRef.current = header
  return { ...hook, header }
}

describe('useStickyHeader', () => {
  afterEach(() => {
    setScrollY(0)
  })

  it('fixes a direction-based header out of sight on the way down', async () => {
    const { result, header } = renderStickyHeader(true)

    await scrollTo(500)

    expect(result.current.isSticky).toBe(true)
    expect(result.current.isVisible).toBe(false)
    expect(header.style.position).toBe('fixed')
  })

  it('hands the header back to the normal layout when disabled', async () => {
    const { result, rerender, header } = renderStickyHeader(true)
    await scrollTo(500)

    rerender({ isEnabled: false })

    expect(result.current.isSticky).toBe(false)
    expect(result.current.isVisible).toBe(true)
    expect(header.style.position).toBe('')
  })

  it('ignores the scroll while disabled', async () => {
    const { result, header } = renderStickyHeader(false)

    await scrollTo(500)

    expect(result.current.isSticky).toBe(false)
    expect(result.current.isVisible).toBe(true)
    expect(header.style.position).toBe('')
  })
})
