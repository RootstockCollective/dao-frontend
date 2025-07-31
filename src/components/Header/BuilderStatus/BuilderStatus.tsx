import { useBuilderContext } from '@/app/context/builder/BuilderContext'
import { Builder } from '@/app/types'
import { Address } from 'viem'
import { BuilderStatusView } from './BuilderStatusView'
import { isBuilderDeactivated, isBuilderKycRevoked, useHandleErrors } from '@/app/utils'
import { ExtendedBuilderState } from './types'

interface BuilderStatusProps {
  address: Address | undefined
}
const getBuilderState = (builder: Builder): ExtendedBuilderState => {
  if (!builder.stateFlags) return 'inProgress'
  if (isBuilderDeactivated(builder) || isBuilderKycRevoked(builder.stateFlags)) return 'deactivated'
  const { paused, activated, communityApproved } = builder.stateFlags
  if (!activated || !communityApproved) return 'inProgress'
  return paused ? 'paused' : 'active'
}

export function BuilderStatus({ address }: BuilderStatusProps) {
  const { getBuilderByAddress, isLoading, error } = useBuilderContext()

  useHandleErrors({ error, title: 'Error loading builder status' })

  if (!address || isLoading) return null

  const builder = getBuilderByAddress(address)
  if (!builder) return null

  const builderState = getBuilderState(builder)

  return <BuilderStatusView builderState={builderState} />
}

export default BuilderStatus
