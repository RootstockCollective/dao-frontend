import { useState, useCallback } from 'react'

export const useSteps = (maxSteps: number) => {
  const [step, setStep] = useState(0)

  const onGoNext = useCallback(() => setStep(p => (p === maxSteps - 1 ? p : p + 1)), [maxSteps])

  const onGoBack = useCallback(() => setStep(p => (p === 0 ? p : p - 1)), [])

  const onReset = useCallback(() => setStep(0), [])

  const onGoToStep = useCallback((step: number) => setStep(step), [])

  return { step, onGoBack, onGoNext, onReset, onGoToStep }
}
