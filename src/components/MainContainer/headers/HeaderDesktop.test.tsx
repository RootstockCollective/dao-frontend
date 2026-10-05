import { cleanup, render, screen } from '@testing-library/react'
import { type PropsWithChildren, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopBarDockProvider, useTopBarDock } from '../TopBarDockProvider'
import { HeaderDesktop } from './HeaderDesktop'

vi.mock('@/components/Breadcrumbs', () => ({ Breadcrumbs: () => null }))
vi.mock('@/components/Tooltip', () => ({ Tooltip: ({ children }: PropsWithChildren) => <>{children}</> }))
vi.mock('@/shared/walletConnection', () => ({
  UserConnectionManager: ({ className, inert }: { className?: string; inert?: boolean }) => (
    <div className={className} inert={inert} data-testid="TopBarConnect">
      <button type="button">Connect wallet</button>
    </div>
  ),
}))
vi.mock('@/components/MainContainer/LayoutProvider', () => ({
  useLayoutContext: () => ({ isSidebarOpen: true, toggleSidebar: () => {} }),
}))

interface PageProps {
  isActive?: boolean
  isDocked?: boolean
}

/** Stands in for a page with a prompt: drives the dock state and portals into the slot. */
const Page = ({ isActive = false, isDocked = false }: PageProps) => {
  const { slot, setActive, setDocked } = useTopBarDock()
  useEffect(() => {
    setActive(isActive)
  }, [isActive, setActive])
  useEffect(() => {
    setDocked(isDocked)
  }, [isDocked, setDocked])
  return slot && isActive ? createPortal(<p>Docked prompt</p>, slot) : null
}

const renderHeader = (props: PageProps = {}) => {
  const ui = (pageProps: PageProps) => (
    <TopBarDockProvider>
      <HeaderDesktop />
      <Page {...pageProps} />
    </TopBarDockProvider>
  )
  const { rerender } = render(ui(props))
  return { rerenderPage: (pageProps: PageProps) => rerender(ui(pageProps)) }
}

const topBarConnect = () => screen.getByTestId('TopBarConnect')
/** The row holding the sidebar toggle, the breadcrumbs and the Connect button. */
const topBarRow = () => screen.getByTestId('SidebarToggle').closest('header > div')

describe('HeaderDesktop', () => {
  afterEach(() => {
    cleanup()
  })

  it('sits in the normal flow without a prompt', () => {
    renderHeader()

    expect(screen.getByRole('banner')).not.toHaveClass('sticky')
    expect(topBarConnect()).not.toHaveAttribute('inert')
  })

  it('sticks to the top while a page has a prompt, and hosts it right under the bar', () => {
    renderHeader({ isActive: true })

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0')
    expect(header).toContainElement(screen.getByText('Docked prompt'))
    expect(topBarConnect()).not.toHaveAttribute('inert')
  })

  it('keeps the same geometry with and without a prompt, so the bar does not jump', () => {
    const { rerenderPage } = renderHeader()
    const header = screen.getByRole('banner')
    expect(header).not.toHaveClass('pt-6')
    expect(topBarRow()).toHaveClass('min-h-16')

    rerenderPage({ isActive: true })

    expect(header).not.toHaveClass('pt-6')
    expect(topBarRow()).toHaveClass('min-h-16')
  })

  it('steps its Connect button aside while the prompt is docked, and brings it back after', () => {
    const { rerenderPage } = renderHeader({ isActive: true, isDocked: true })

    expect(topBarConnect()).toHaveAttribute('inert')
    expect(topBarConnect()).toHaveClass('pointer-events-none', 'opacity-0')

    rerenderPage({ isActive: true, isDocked: false })

    expect(topBarConnect()).not.toHaveAttribute('inert')
    expect(topBarConnect()).not.toHaveClass('opacity-0')
  })
})
