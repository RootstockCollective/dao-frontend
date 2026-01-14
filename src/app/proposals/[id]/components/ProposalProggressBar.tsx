import { Fragment, useRef, useLayoutEffect, useState, useCallback } from 'react'
import { Span } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
import { ProposalState } from '@/shared/types'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  proposalState?: ProposalState
}

const proposalStateToProgressMap = new Map([
  [ProposalState.Active, 25],
  [ProposalState.Succeeded, 50],
  [ProposalState.Queued, 75],
  [ProposalState.Executed, 100],
  [ProposalState.Defeated, 100],
  [ProposalState.Canceled, 100],
  [undefined, 0],
])

const getStatusSteps = (proposalState?: ProposalState) => {
  if (proposalState === ProposalState.Defeated || proposalState === ProposalState.Canceled) {
    return ['ACTIVE', 'FAILED']
  }
  return ['ACTIVE', 'SUCCEEDED', 'QUEUED', 'EXECUTED']
}

const getCurrentStepIndex = (proposalState?: ProposalState) => {
  switch (proposalState) {
    case ProposalState.Active:
      return 0
    case ProposalState.Succeeded:
      return 1
    case ProposalState.Queued:
      return 2
    case ProposalState.Executed:
      return 3
    case ProposalState.Defeated:
    case ProposalState.Canceled:
      return 1 // FAILED is at index 1
    default:
      return 0
  }
}

const renderStatusPath = (proposalState?: ProposalState) => {
  const steps = getStatusSteps(proposalState)
  const currentStepIndex = getCurrentStepIndex(proposalState)

  const classname = 'text-base leading-normal tracking-[1.28px] uppercase'

  return (
    <>
      {steps.map((step, index) => (
        <Fragment key={step}>
          <Span
            variant="body-s"
            className={cn(
              classname,
              'font-medium flex-shrink-0',
              index === currentStepIndex ? 'text-text-100' : 'text-bg-0',
            )}
          >
            {step}
          </Span>
          {index < steps.length - 1 && (
            <Span variant="body-s" className={cn(classname, 'text-xl flex-shrink-0 mx-2 text-bg-0')}>
              {'>'}
            </Span>
          )}
        </Fragment>
      ))}
    </>
  )
}

export const ProposalProggressBar = ({ proposalState }: ProgressBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  // Calculate offset to keep active label in view
  const calculateOffset = useCallback(() => {
    if (!containerRef.current || !contentRef.current) {
      return 0
    }

    const containerWidth = containerRef.current.offsetWidth
    const contentWidth = contentRef.current.scrollWidth

    // If content fits in container, no offset needed
    if (contentWidth <= containerWidth) {
      return 0
    }

    const currentStepIndex = getCurrentStepIndex(proposalState)

    // Calculate position of current active step
    // Each step is roughly: label (60px) + arrow (16px) = 76px
    const stepWidth = 76
    const currentStepPosition = currentStepIndex * stepWidth

    // Calculate how much we need to slide to keep current step visible
    const containerCenter = containerWidth / 2
    const desiredOffset = Math.max(0, currentStepPosition - containerCenter + 40)

    // Don't slide more than needed to keep content in bounds (with padding)
    const maxOffset = contentWidth - containerWidth
    return Math.min(desiredOffset, maxOffset)
  }, [proposalState])

  // Update offset when proposal state changes
  useLayoutEffect(() => {
    const newOffset = calculateOffset()
    setOffset(newOffset)
  }, [proposalState, calculateOffset])

  // Handle window resize
  useLayoutEffect(() => {
    const handleResize = () => {
      const newOffset = calculateOffset()
      setOffset(newOffset)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [proposalState, calculateOffset])

  return (
    <div className="flex flex-col w-full md:p-6 p-4 md:pb-10" ref={containerRef}>
      <div
        ref={contentRef}
        className="flex flex-row justify-between w-full"
        style={{ transform: offset > 0 ? `translateX(-${offset}px)` : undefined }}
      >
        {renderStatusPath(proposalState)}
      </div>
      <ProgressBar
        progress={proposalStateToProgressMap.get(proposalState) ?? 0}
        className="mt-3"
        color={['#4B5CF0', '#F4722A', '#1BC47D']}
      />
    </div>
  )
}
