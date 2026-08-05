import { AnimatedGradientSurface } from '@/components/AnimatedGradientSurface'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { RequirementRow } from '@/components/RequirementRow'
import { StepDots } from '@/components/StepDots'
import { Header, Label, Paragraph, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

import { ProviderCard } from './components/ProviderCard'
import { WalletCard } from './components/WalletCard'
import { STEP_CONTENT } from './config'
import { INTRO_STEP_GAS, INTRO_STEP_SUMMARY, type UseIntroStepsReturn } from './hooks/useIntroSteps'

/** Pill radius is local to this screen — the shared Button is deliberately still `rounded-sm`. */
const PILL = 'rounded-full'

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
}

export const IntroModalContent = ({
  wizard,
  rifBalance,
  rbtcBalance,
  needsRif,
  needsGas,
  minGas,
  onOpenProvider,
  onSkip,
  onStake,
  onClose,
}: Props) => {
  const { currentStep, currentIndex, totalSteps, isFirstStep, isLastStep, goNext, goBack } = wizard
  const content = STEP_CONTENT[currentStep.id]

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
          className="h-[30dvh] shrink-0 md:h-auto md:w-[36%] md:rounded-l-3xl"
        >
          {/* The surface wraps children in its own full-height div, so the layout has to live
              on a child of it rather than on the surface's own className. */}
          <div className="flex h-full flex-col justify-between gap-4 p-4 md:p-6">
            <Label variant="tag" caps className="text-text-100">
              Your wallet
            </Label>
            <WalletCard rifBalance={rifBalance} rbtcBalance={rbtcBalance} needsRif={needsRif} />
          </div>
        </AnimatedGradientSurface>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-10 md:p-6 md:pt-12">
            <div className="mb-6 flex flex-row items-center justify-between gap-4">
              <Label variant="tag" caps className="text-bg-40" data-testid="intro-step-counter">
                Step {currentIndex + 1} of {totalSteps}
              </Label>
              <StepDots total={totalSteps} current={currentIndex} />
            </div>

            <Label variant="tag" caps className="text-bg-40">
              {content.eyebrow}
            </Label>
            <Header variant="h1" caps className="text-bg-100 mt-1" data-testid="intro-step-title">
              {content.title}
            </Header>

            {content.description && <Paragraph className="text-bg-100 mt-4">{content.description}</Paragraph>}

            {currentStep.id === INTRO_STEP_GAS && <GasCallout minGas={minGas} />}

            {content.providers.length > 0 && (
              <div className="mt-6 flex flex-col gap-3">
                {content.providers.map(provider => (
                  <ProviderCard
                    key={`${provider.name}-${provider.tagline}`}
                    provider={provider}
                    onOpen={onOpenProvider}
                  />
                ))}
              </div>
            )}

            {currentStep.id === INTRO_STEP_SUMMARY && (
              <div className="mt-6 flex flex-col gap-3">
                <RequirementRow position={1} label="RIF in your wallet" isDone={!needsRif} />
                <RequirementRow position={2} label="rBTC for gas" isDone={!needsGas} />
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-row items-center justify-between gap-4 p-4 md:p-6">
            {isFirstStep ? (
              <button
                type="button"
                onClick={onSkip}
                className="text-bg-100 underline underline-offset-4"
                data-testid="intro-skip"
              >
                <Span variant="body-s">Skip for now — just explore</Span>
              </button>
            ) : (
              <button
                type="button"
                onClick={goBack}
                className="text-bg-100 underline underline-offset-4"
                data-testid="intro-back"
              >
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
      <Header variant="e3" className="text-bg-100 mt-1" data-testid="intro-min-gas">
        {minGas} rBTC
      </Header>
    </div>
    <Paragraph variant="body-s" className="text-bg-40 max-w-[50%] text-right">
      Covers approving and staking, with room for a few votes.
    </Paragraph>
  </div>
)
