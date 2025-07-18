'use client'

import { createContext, useState, useMemo, type PropsWithChildren, useContext } from 'react'

export const ProposalStep = {
  None: 'None',
  Type: 'Type',
  Details: 'Details',
  Review: 'Review',
} as const
export type ProposalStep = keyof typeof ProposalStep

interface ProposalStepperState {
  currentStep: ProposalStep
  setCurrentStep: (step: ProposalStep) => void
}

const ProposalStepperContext = createContext<ProposalStepperState | null>(null)

export function StepperProvider({ children }: PropsWithChildren) {
  const [currentStep, setCurrentStep] = useState<ProposalStep>(ProposalStep.None)
  const value = useMemo<ProposalStepperState>(
    () => ({
      currentStep,
      setCurrentStep,
    }),
    [currentStep],
  )
  return <ProposalStepperContext.Provider value={value}>{children}</ProposalStepperContext.Provider>
}

export function useProposalStepper() {
  const context = useContext(ProposalStepperContext)
  if (!context) throw new Error('Use Stepper context provider')
  return context
}
