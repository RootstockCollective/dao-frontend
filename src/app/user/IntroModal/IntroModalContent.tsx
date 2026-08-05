import type { Address } from 'viem'

import { AnimatedGradientSurface } from '@/components/AnimatedGradientSurface'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { RequirementRow } from '@/components/RequirementRow'
import { StepDots } from '@/components/StepDots'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { ProviderCard } from './components/ProviderCard'
import { WalletCard } from './components/WalletCard'
import { WalletIdentity } from './components/WalletIdentity'
import { STEP_CONTENT } from './config'
import { INTRO_STEP_GAS, INTRO_STEP_SUMMARY, type UseIntroStepsReturn } from './hooks/useIntroSteps'

/** Pill radius is local to this screen — the shared Button is deliberately still `rounded-sm`. */
const PILL = 'rounded-full'

const TEXT_BUTTON =
  'text-bg-100 rounded-sm underline underline-offset-4 focus-visible:outline-bg-100 focus-visible:outline-2 focus-visible:outline-offset-2'

interface Props {
  wizard: UseIntroStepsReturn
  rifBalance: string
  rbtcBalance: string
  needsRif: boolean
  needsGas: boolean
  /** The same figure the gas gate uses, so copy and gate can never disagree. */
  minGas: string
  onOpenProvider: (url: string) => void
  onSkip: () => void
  onStake: () => void
  onClose: () => void
  /** The connected wallet, shown so the user knows where to send funds. */
  address?: Address
  /** True while a balance re-read is in flight. */
  isRefreshing?: boolean
  onRefresh?: () => void
}

export const IntroModalContent = ({
  wizard,
  address,
  rifBalance,
  rbtcBalance,
  needsRif,
  needsGas,
  minGas,
  isRefreshing = false,
  onRefresh,
  onOpenProvider,
  onSkip,
  onStake,
  onClose,
}: Props) => {
  const { currentStep, currentIndex, totalSteps, isFirstStep, isLastStep, goNext, goBack } = wizard
  const content = STEP_CONTENT[currentStep.id]
  const isEverythingMet = !needsRif && !needsGas
  const description =
    currentStep.id === INTRO_STEP_SUMMARY && isEverythingMet
      ? (content.descriptionWhenReady ?? content.description)
      : content.description

  return (
    <Modal
      width={920}
      // Tall enough that all four provider tiles on the RIF step fit without scrolling.
      height={700}
      onClose={onClose}
      onEscape={onClose}
      trapFocus
      ariaLabel="Get ready to stake RIF"
      closeButtonColor="black"
      // Two overrides of the shared Modal, both scoped here:
      // - the panel itself must not scroll, so the step body scrolls inside it and the footer
      //   buttons stay reachable on a fullscreen mobile sheet;
      // - a generous corner radius, but only from md up — on mobile this is a fullscreen sheet
      //   and rounded corners against the viewport edge look like a rendering bug.
      className="bg-text-80 overflow-y-hidden rounded-none md:rounded-3xl"
      data-testid="intro-modal"
    >
      <div className="flex h-full flex-col md:flex-row">
        {/* Carries its own left-corner radius so the rounding does not depend on the modal
            panel clipping a child that establishes its own overflow context. Mobile is a flat
            top band inside a fullscreen sheet, so no radius there. */}
        <AnimatedGradientSurface
          step={currentIndex}
          // `min-h` rather than a fixed `h` on mobile: at 30dvh the wallet card was clipped on
          // any phone shorter than ~700px. It now takes the height its content needs.
          className="min-h-[30dvh] shrink-0 md:h-auto md:min-h-0 md:w-[36%] md:rounded-l-3xl"
        >
          {/* The surface wraps children in its own full-height div, so the layout has to live
              on a child of it rather than on the surface's own className. */}
          <div className="flex h-full flex-col justify-between gap-4 p-4 md:p-6">
            {/* Padded away from the modal's absolutely-positioned close button. */}
            <WalletIdentity address={address} className="pr-10" />
            <WalletCard
              rifBalance={rifBalance}
              rbtcBalance={rbtcBalance}
              needsRif={needsRif}
              needsGas={needsGas}
            />
          </div>
        </AnimatedGradientSurface>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-10 md:p-6 md:pt-12">
            {/* Hidden when there is only one step: "STEP 1 OF 1" is noise, and StepDots
                already hides itself for the same reason. */}
            {totalSteps > 1 && (
              <div className="mb-6 flex flex-row items-center justify-between gap-4">
                <Label variant="tag" caps className="text-bg-40" data-testid="intro-step-counter">
                  Step {currentIndex + 1} of {totalSteps}
                </Label>
                <StepDots total={totalSteps} current={currentIndex} />
              </div>
            )}

            {/* The step swaps content in place with no navigation, so without this a screen
                reader user hears nothing at all after pressing Next. */}
            <div aria-live="polite" aria-atomic="true">
              <Label variant="tag" caps className="text-bg-40">
                {content.eyebrow}
              </Label>
              <Header variant="h2" caps className="text-bg-100 mt-1" data-testid="intro-step-title">
                {content.title}
              </Header>

              {description && <Paragraph className="text-bg-100 mt-4">{description}</Paragraph>}
            </div>

            {currentStep.id === INTRO_STEP_GAS && <GasCallout minGas={minGas} />}

            {content.providers.length > 0 && (
              <ul className="mt-6 flex list-none flex-col gap-3 p-0">
                {content.providers.map(provider => (
                  <li key={`${provider.name}-${provider.tagline}`}>
                    <ProviderCard provider={provider} onOpen={onOpenProvider} />
                  </li>
                ))}
              </ul>
            )}

            {currentStep.id === INTRO_STEP_SUMMARY && (
              <>
                <ul className="mt-6 flex list-none flex-col gap-3 p-0">
                  <li>
                    <RequirementRow position={1} label="RIF in your wallet" isDone={!needsRif} />
                  </li>
                  <li>
                    <RequirementRow position={2} label="rBTC for gas" isDone={!needsGas} />
                  </li>
                </ul>

                {/* Only here. The earlier steps say "go and do this" — they are not screens
                    the user is waiting on, and repeating this under each one competes with
                    Next for attention. This is the screen that asks "are we there yet", so
                    this is where re-checking has something to point at. Returning from a
                    provider tab refreshes on its own, and the balances poll besides; this is
                    for the user who is sitting here watching a bridge take its time. */}
                {onRefresh && !isEverythingMet && (
                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className={cn(TEXT_BUTTON, 'mt-4 disabled:no-underline disabled:opacity-60')}
                    data-testid="intro-refresh"
                  >
                    <Span variant="body-s">
                      {isRefreshing ? 'Checking your wallet…' : 'Already sent? Check again'}
                    </Span>
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex shrink-0 flex-row items-center justify-between gap-4 p-4 md:p-6">
            {isFirstStep ? (
              <button type="button" onClick={onSkip} className={TEXT_BUTTON} data-testid="intro-skip">
                <Span variant="body-s">Skip for now — just explore</Span>
              </button>
            ) : (
              <button type="button" onClick={goBack} className={TEXT_BUTTON} data-testid="intro-back">
                <Span variant="body-s">Back</Span>
              </button>
            )}

            {isLastStep ? (
              <Button
                onClick={onStake}
                disabled={needsRif || needsGas}
                className={cn(PILL, 'w-auto')}
                data-testid="intro-stake"
              >
                Stake RIF
              </Button>
            ) : (
              <Button onClick={goNext} className={cn(PILL, 'w-auto')} data-testid="intro-next">
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

const GasCallout = ({ minGas }: { minGas: string }) => (
  <div className="bg-bg-100/5 mt-6 flex flex-row items-start justify-between gap-4 rounded-2xl p-4">
    <div>
      <Label variant="tag" caps className="text-bg-40">
        You need about
      </Label>
      {/* Not a heading — it is the callout's value. `e3` is uppercase by design, which is why
          the unit is a separate, un-capsed span: "RBTC" is not how the token is written. */}
      <Span variant="e3" className="text-bg-100 mt-1 block" data-testid="intro-min-gas">
        {minGas}{' '}
        <Span variant="body" bold className="text-bg-100">
          rBTC
        </Span>
      </Span>
    </div>
    <Paragraph variant="body-s" className="text-bg-40 max-w-[50%] text-right">
      Covers approving and staking, with room for a few votes.
    </Paragraph>
  </div>
)
