import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { StepperProvider } from './components/stepper/StepperProvider'

export const metadata: Metadata = {
  title: 'RootstockCollective — Proposals',
}

export default function Layout({ children }: PropsWithChildren) {
  return <StepperProvider>{children}</StepperProvider>
}
