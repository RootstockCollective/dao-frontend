import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useIntroSteps } from './hooks/useIntroSteps'
import { IntroModalContent } from './IntroModalContent'

// `Modal` portals into document.body and gates on a media query; none of that is what these
// tests are about, and `useIsDesktop` would otherwise force the fullscreen mobile branch.
vi.mock('@/shared/hooks/useIsDesktop', () => ({ useIsDesktop: () => true }))
vi.mock('@/components/Header/Jdenticon', () => ({ Jdenticon: () => <svg data-testid="jdenticon" /> }))

const ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as const

interface HarnessProps {
  needsRif: boolean
  needsGas: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  onClose?: () => void
  onSkip?: () => void
}

const Harness = ({ needsRif, needsGas, ...rest }: HarnessProps) => {
  const wizard = useIntroSteps({ needsRif, needsGas })

  return (
    <IntroModalContent
      wizard={wizard}
      address={ADDRESS}
      rifBalance={needsRif ? '0' : '1250.5'}
      rbtcBalance={needsGas ? '0' : '0.004'}
      needsRif={needsRif}
      needsGas={needsGas}
      minGas="0.0002"
      onOpenProvider={vi.fn()}
      onSkip={vi.fn()}
      onStake={vi.fn()}
      onClose={vi.fn()}
      {...rest}
    />
  )
}

const renderContent = (props: HarnessProps) => render(<Harness {...props} />)

describe('IntroModalContent', () => {
  // `globals` is off in this project, so RTL's auto-cleanup never registers. The modal portals
  // into document.body, which makes a leaked render show up as duplicate matches everywhere.
  afterEach(cleanup)

  describe('step navigation', () => {
    it('advances the counter and the dots together', async () => {
      const user = userEvent.setup()
      renderContent({ needsRif: true, needsGas: true })

      expect(screen.getByTestId('intro-step-counter')).toHaveTextContent('Step 1 of 3')
      expect(screen.getByTestId('step-dots-segment-1')).toHaveAttribute('data-filled', 'false')

      await user.click(screen.getByTestId('intro-next'))

      expect(screen.getByTestId('intro-step-counter')).toHaveTextContent('Step 2 of 3')
      expect(screen.getByTestId('step-dots-segment-1')).toHaveAttribute('data-filled', 'true')
    })

    it('offers the permanent skip only on the first step', async () => {
      const user = userEvent.setup()
      renderContent({ needsRif: true, needsGas: true })

      expect(screen.getByTestId('intro-skip')).toBeInTheDocument()

      await user.click(screen.getByTestId('intro-next'))

      expect(screen.queryByTestId('intro-skip')).not.toBeInTheDocument()
      expect(screen.getByTestId('intro-back')).toBeInTheDocument()
    })
  })

  // "STEP 1 OF 1" is noise, and StepDots already hides itself for the same reason.
  describe('single-step flow', () => {
    it('hides the step counter and the dots', () => {
      renderContent({ needsRif: false, needsGas: false })

      expect(screen.queryByTestId('intro-step-counter')).not.toBeInTheDocument()
      expect(screen.queryByTestId('step-dots')).not.toBeInTheDocument()
    })

    // The static copy told the user to wait for funds the checklist showed as already landed.
    it('uses the copy that does not contradict a satisfied checklist', () => {
      renderContent({ needsRif: false, needsGas: false })

      expect(screen.getByText(/everything is in place/i)).toBeInTheDocument()
      expect(screen.queryByText(/as soon as both land/i)).not.toBeInTheDocument()
    })

    it('enables the stake button', () => {
      renderContent({ needsRif: false, needsGas: false })

      expect(screen.getByTestId('intro-stake')).toBeEnabled()
    })
  })

  describe('the stake gate', () => {
    it('stays disabled while any requirement is unmet', async () => {
      const user = userEvent.setup()
      // Gas only, so the flow is [gas, summary] — the stake button lives on the last step.
      renderContent({ needsRif: false, needsGas: true })
      await user.click(screen.getByTestId('intro-next'))

      expect(screen.getByTestId('intro-stake')).toBeDisabled()
    })
  })

  describe('wallet panel', () => {
    it('shows the connected address rather than a static label', () => {
      renderContent({ needsRif: true, needsGas: true })

      expect(within(screen.getByTestId('intro-wallet-identity')).getByText('0xf39F…2266')).toBeInTheDocument()
      expect(screen.queryByText(/^your wallet$/i)).not.toBeInTheDocument()
    })

    // Keying the status off `needsRif` alone made the most prominent line on screen say
    // "Ready to stake" while the summary said the user had no gas.
    it('never says ready while gas is still missing', () => {
      renderContent({ needsRif: false, needsGas: true })

      expect(within(screen.getByTestId('wallet-info')).getByText('You need rBTC to cover fees')).toBeInTheDocument()
      expect(screen.queryByText('Ready to stake')).not.toBeInTheDocument()
    })

    it('names both gaps when both are missing', () => {
      renderContent({ needsRif: true, needsGas: true })

      expect(
        within(screen.getByTestId('wallet-info')).getByText('You need RIF and a little rBTC'),
      ).toBeInTheDocument()
    })
  })

  describe('manual balance refresh', () => {
    /** Walks to the summary, which is the only step that offers a re-check. */
    const goToSummary = async (user: ReturnType<typeof userEvent.setup>, steps: number) => {
      for (let i = 0; i < steps; i++) {
        await user.click(screen.getByTestId('intro-next'))
      }
    }

    it('lets the user ask again rather than wait out the poll', async () => {
      const user = userEvent.setup()
      const onRefresh = vi.fn()
      renderContent({ needsRif: true, needsGas: true, onRefresh })
      await goToSummary(user, 2)

      await user.click(screen.getByTestId('intro-refresh'))

      expect(onRefresh).toHaveBeenCalledOnce()
    })

    it('reports that a check is in flight', async () => {
      const user = userEvent.setup()
      renderContent({ needsRif: true, needsGas: true, onRefresh: vi.fn(), isRefreshing: true })
      await goToSummary(user, 2)

      const refresh = screen.getByTestId('intro-refresh')
      expect(refresh).toBeDisabled()
      expect(refresh).toHaveTextContent(/checking/i)
    })

    // The earlier steps say "go and do this" — a re-check there would compete with Next and
    // has nothing on screen to point at.
    it('is offered only on the summary step', async () => {
      const user = userEvent.setup()
      renderContent({ needsRif: true, needsGas: true, onRefresh: vi.fn() })

      expect(screen.queryByTestId('intro-refresh')).not.toBeInTheDocument()
      await goToSummary(user, 1)
      expect(screen.queryByTestId('intro-refresh')).not.toBeInTheDocument()

      await goToSummary(user, 1)
      expect(screen.getByTestId('intro-refresh')).toBeInTheDocument()
    })

    it('is hidden once there is nothing left to wait for', () => {
      renderContent({ needsRif: false, needsGas: false, onRefresh: vi.fn() })

      expect(screen.queryByTestId('intro-refresh')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('announces step changes through a live region', () => {
      renderContent({ needsRif: true, needsGas: true })

      const live = screen.getByTestId('intro-step-title').closest('[aria-live]')
      expect(live).toHaveAttribute('aria-live', 'polite')
    })

    // The balance used to render as an <h1> and outrank the step title.
    it('leaves the step title as the only heading in the dialog', () => {
      renderContent({ needsRif: true, needsGas: true })

      const headings = screen.getAllByRole('heading')
      expect(headings).toHaveLength(1)
      expect(headings[0]).toHaveTextContent(/add rif to your wallet/i)
    })

    // Anchors, not buttons: middle-click, cmd-click and "copy link address" all matter for a
    // row whose whole job is to send the user somewhere else.
    it('renders provider rows as links that open in a new tab', () => {
      renderContent({ needsRif: true, needsGas: true })

      const sushi = screen.getByTestId('provider-card-sushi')
      expect(sushi.tagName).toBe('A')
      expect(sushi).toHaveAttribute('target', '_blank')
      expect(sushi).toHaveAttribute('rel', expect.stringContaining('noopener'))
    })

    it('nests no block elements inside interactive rows', () => {
      renderContent({ needsRif: true, needsGas: true })

      expect(screen.getByTestId('provider-card-sushi').querySelector('p')).toBeNull()
    })
  })
})
