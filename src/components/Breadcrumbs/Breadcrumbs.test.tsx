import { cleanup, render, screen } from '@testing-library/react'
import { usePathname } from 'next/navigation'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: (props: { children: ReactNode; href: string } & Record<string, unknown>) => {
    const { children, href, ...rest } = props
    return createElement('a', { href, ...rest }, children)
  },
}))

const mockUsePathname = vi.mocked(usePathname)

describe('Breadcrumbs', () => {
  afterEach(() => cleanup())

  beforeEach(() => {
    mockUsePathname.mockReset()
  })

  it('uses primary styling on parent links and text-text-100 on the current segment for a multi-segment path', () => {
    mockUsePathname.mockReturnValue('/btc-vault/request-history')

    render(<Breadcrumbs />)

    const links = screen.getAllByTestId('breadcrumb-link')
    expect(links).toHaveLength(2)
    for (const link of links) {
      expect(link.className).toMatch(/\btext-primary\b/)
    }

    const current = screen.getByTestId('breadcrumb-current')
    expect(current.className).toMatch(/\btext-text-100\b/)
    expect(current).toHaveTextContent('Transactions History')
  })

  it('keeps text-text-100 on the current segment when only one path segment follows Home', () => {
    mockUsePathname.mockReturnValue('/staking-history')

    render(<Breadcrumbs />)

    expect(screen.getAllByTestId('breadcrumb-link')).toHaveLength(1)
    const current = screen.getByTestId('breadcrumb-current')
    expect(current.className).toMatch(/\btext-text-100\b/)
    expect(current).toHaveTextContent('Staking History')
  })
})
