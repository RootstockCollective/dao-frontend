'use client'

import { useVotingPowerRedirect } from '../../hooks/useVotingPowerRedirect'
import { VotingPowerLoading } from '@/components/LoadingSpinner'
import { type ReactNode } from 'react'

interface VotingPowerWrapperProps {
  children: ReactNode
}

export const VotingPowerWrapper = ({ children }: VotingPowerWrapperProps) => {
  const { isVotingPowerLoading, canCreateProposal } = useVotingPowerRedirect()

  if (isVotingPowerLoading || !canCreateProposal) {
    return <VotingPowerLoading />
  }

  return children
}
