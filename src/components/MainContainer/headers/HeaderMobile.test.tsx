import { act, cleanup, render, screen } from '@testing-library/react'
import { type Ref, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TopBarDockProvider, useTopBarDock } from '../TopBarDockProvider'
import { HeaderMobile } from './HeaderMobile'

vi.mock('@/components/Hamburger', () => ({ Hamburger: () => null }))
vi.mock('@/components/NetworkLogo', () => ({ NetworkLogo: () => null }))
vi.mock('@/shared/walletConnection', () => ({
  UserConnectionManager: ({
    className,
    inert,
    ref,
  }: {
    className?: string
    inert?: boolean
    ref?: Ref<HTMLDivElement>
  }) => (
    <div ref={ref} className={className} inert={inert} data-testid="TopBarConnect">
      <button type="button">Connect wallet</button>
    </div>
  ),
}))
vi.mock('@/components/MainContainer/LayoutProvider', () => ({
  useLayoutContext: () => ({ isSidebarOpen: false, toggleSidebar: () => {} }),
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
  return slot && isActive
    ? createPortal(
        <p>
          Docked prompt <button type="button">Docked connect</button>
        </p>,
        slot,
      )
    : null
}

const renderHeader = (props: PageProps = {}) => {
  const ui = (pageProps: PageProps) => (
    <TopBarDockProvider>
      <HeaderMobile />
      <Page {...pageProps} />
    </TopBarDockProvider>
  )
  const { rerender } = render(ui(props))
  return { rerenderPage: (pageProps: PageProps) => rerender(ui(pageProps)) }
}

/** Scrolls and waits for the frame the header handles the scroll in. */
const scrollTo = async (y: number) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  await act(async () => {
    window.dispatchEvent(new Event('scroll'))
    await new Promise(resolve => requestAnimationFrame(resolve))
  })
}

describe('HeaderMobile', () => {
  afterEach(() => {
    cleanup()
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })

  it('hides on the way down without a prompt', async () => {
    renderHeader()

    await scrollTo(500)

    expect(screen.getByRole('banner')).toHaveClass('-translate-y-full')
  })

  it('sticks and stays on screen while a page has a prompt, hosting it under the bar', async () => {
    renderHeader({ isActive: true })

    await scrollTo(500)

    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0', 'translate-y-0')
    expect(header.style.position).toBe('')
    expect(header).toContainElement(screen.getByText('Docked prompt'))
  })

  it('goes back to hiding on scroll once the prompt is gone', async () => {
    const { rerenderPage } = renderHeader({ isActive: true })
    await scrollTo(500)

    rerenderPage({ isActive: false })
    await scrollTo(900)

    expect(screen.getByRole('banner')).not.toHaveClass('sticky')
    expect(screen.getByRole('banner')).toHaveClass('-translate-y-full')
  })

  it('steps its Connect button aside while the prompt is docked', () => {
    renderHeader({ isActive: true, isDocked: true })

    const connect = screen.getByTestId('TopBarConnect')
    expect(connect).toHaveAttribute('inert')
    expect(connect).toHaveClass('pointer-events-none', 'opacity-0')
  })

  it('hands the focus to the docked prompt when its Connect steps aside with it', () => {
    const { rerenderPage } = renderHeader({ isActive: true })
    screen.getByRole('button', { name: 'Connect wallet' }).focus()

    rerenderPage({ isActive: true, isDocked: true })

    expect(screen.getByTestId('TopBarConnect')).toHaveAttribute('inert')
    expect(screen.getByRole('button', { name: 'Docked connect' })).toHaveFocus()
  })
})
