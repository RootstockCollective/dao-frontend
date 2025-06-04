import { useState } from 'react'

export const useSteps = (maxSteps: number) => {
  const [step, setStep] = useState(0)

  const onGoNext = () => setStep(p => (p === maxSteps - 1 ? p : p + 1))

  const onGoBack = () => setStep(p => (p === 0 ? p : p - 1))

  const onReset = () => setStep(0)

  return { step, onGoBack, onGoNext, onReset }
}
