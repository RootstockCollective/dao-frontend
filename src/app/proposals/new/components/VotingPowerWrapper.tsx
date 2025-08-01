'use client'

import { useVotingPowerRedirect } from '../../hooks/useVotingPowerRedirect'
import { VotingPowerLoading } from '@/components/LoadingSpinner'
import { type ReactNode } from 'react'

interface VotingPowerWrapperProps {
  children: ReactNode
}

export const VotingPowerWrapper = ({ children }: VotingPowerWrapperProps) => {
  const { isVotingPowerLoading, canCreateProposal } = useVotingPowerRedirect()

  // Show loading state while checking voting power and also during redirect when user lacks sufficient voting power
  if (isVotingPowerLoading || !canCreateProposal) {
    return <VotingPowerLoading />
  }

  return children
}
