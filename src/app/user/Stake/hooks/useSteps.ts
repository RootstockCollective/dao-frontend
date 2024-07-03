import { useState } from 'react'

export const useSteps = (maxSteps = 3) => {
  const [step, setStep] = useState(0)

  const onGoNext = () => setStep(p => {
    if (p === maxSteps) return p
    return p + 1
  })

  const onGoBack = () => setStep(p => {
    if (p === 0) return p
    return p -1
  })

  const onReset = () => setStep(0)

  return { step, onGoBack, onGoNext, onReset }
}
