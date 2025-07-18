'use client'

import { useEffect } from 'react'
import { useProposalStepper } from '../../components/stepper/StepperProvider'

export default function Layout({ children }: React.PropsWithChildren) {
  const { setCurrentStep } = useProposalStepper()
  useEffect(() => {
    setCurrentStep('Review')
    // eslint-disable-next-line
  }, [])
  return <>{children}</>
}
