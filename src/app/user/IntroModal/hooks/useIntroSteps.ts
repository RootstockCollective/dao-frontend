import { useCallback, useMemo, useState } from 'react'

export const INTRO_STEP_RIF = 'rif'
export const INTRO_STEP_GAS = 'gas'
export const INTRO_STEP_SUMMARY = 'summary'

export type IntroStepId = typeof INTRO_STEP_RIF | typeof INTRO_STEP_GAS | typeof INTRO_STEP_SUMMARY

export interface IntroStep {
  id: IntroStepId
  /** True once the balance this step asks for has landed. The summary step is never done. */
  isDone: boolean
}

interface UseIntroStepsParams {
  /** Whether the user is missing RIF (or stRIF) at the moment of the call. */
  needsRif: boolean
  /** Whether the user is below the minimum rBTC needed to cover approve + stake. */
  needsGas: boolean
}

export interface UseIntroStepsReturn {
  /** The frozen step list, with a live `isDone` flag per step. */
  steps: IntroStep[]
  /** The step currently on screen. */
  currentStep: IntroStep
  /** Zero-based index of the current step. */
  currentIndex: number
  /** Total steps in this flow — the N in "STEP i OF N". */
  totalSteps: number
  isFirstStep: boolean
  isLastStep: boolean
  /** Advance to the next step that still needs the user, skipping satisfied ones. */
  goNext: () => void
  /** Step back one position, satisfied or not. */
  goBack: () => void
}

/**
 * Drives the intro onboarding wizard.
 *
 * The step list is computed **once, on mount**, from the balances the user had when the
 * modal opened, and never recomputed. Balances can change mid-flow — the whole flow sends
 * the user off to a DEX in another tab — and a step list that recomputed would reflow the
 * stepper underneath them, moving "STEP 2 OF 3" while they read it.
 *
 * Instead, satisfied steps stay in the list and flip to `isDone`, so the count is stable
 * and the display is still honest. `goNext` skips them.
 *
 * A step that becomes done while the user is standing on it does **not** auto-advance:
 * yanking the screen out from under someone mid-read is worse than one extra click.
 */
export const useIntroSteps = ({ needsRif, needsGas }: UseIntroStepsParams): UseIntroStepsReturn => {
  // Lazy initializer: the list is derived from the *initial* balances only.
  const [stepIds] = useState<IntroStepId[]>(() => {
    const ids: IntroStepId[] = []

    if (needsRif) {
      ids.push(INTRO_STEP_RIF)
    }
    if (needsGas) {
      ids.push(INTRO_STEP_GAS)
    }
    // The summary always closes the flow, so there is always at least one step.
    ids.push(INTRO_STEP_SUMMARY)

    return ids
  })

  const [currentIndex, setCurrentIndex] = useState(0)

  const steps = useMemo<IntroStep[]>(
    () =>
      stepIds.map(id => {
        switch (id) {
          case INTRO_STEP_RIF:
            return { id, isDone: !needsRif }
          case INTRO_STEP_GAS:
            return { id, isDone: !needsGas }
          case INTRO_STEP_SUMMARY:
            return { id, isDone: false }
        }
      }),
    [stepIds, needsRif, needsGas],
  )

  const goNext = useCallback(() => {
    setCurrentIndex(current => {
      // Skip anything already satisfied. The summary is never done and always last,
      // so this always lands somewhere unless we are already on the final step.
      for (let next = current + 1; next < steps.length; next++) {
        if (!steps[next].isDone) {
          return next
        }
      }
      return current
    })
  }, [steps])

  // Deliberately does not skip satisfied steps: going back to "add RIF" after it turned
  // green is a legitimate move — the user may want more RIF than they just bought.
  const goBack = useCallback(() => {
    setCurrentIndex(current => (current === 0 ? current : current - 1))
  }, [])

  return {
    steps,
    currentStep: steps[currentIndex],
    currentIndex,
    totalSteps: steps.length,
    isFirstStep: currentIndex === 0,
    isLastStep: currentIndex === steps.length - 1,
    goNext,
    goBack,
  }
}
