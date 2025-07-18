import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { Builder, BuilderState } from '@/app/collective-rewards/types'
import { Address } from 'viem'
import { BuilderStatusView } from './BuilderStatusView'
import { isBuilderDeactivated, isBuilderKycRevoked, useHandleErrors } from '@/app/collective-rewards/utils'

interface BuilderStatusProps {
  address: Address | undefined
}

const getBuilderState = (builder: Builder): BuilderState | undefined => {
  const { stateFlags } = builder
  if (!stateFlags) return 'inProgress'
  if (isBuilderDeactivated(builder) || isBuilderKycRevoked(stateFlags)) {
    return undefined
  }
  const { paused, activated, communityApproved } = stateFlags
  if (!activated || !communityApproved) return 'inProgress'
  return paused ? undefined : 'active'
}

export function BuilderStatus({ address }: BuilderStatusProps) {
  const { getBuilderByAddress, isLoading, error } = useBuilderContext()

  useHandleErrors({ error, title: 'Error loading builder status' })

  if (!address || isLoading) return null

  const builder = getBuilderByAddress(address)
  if (!builder) return null

  const builderState = getBuilderState(builder)
  if (!builderState) return null

  return <BuilderStatusView builderState={builderState} />
}

export default BuilderStatus
