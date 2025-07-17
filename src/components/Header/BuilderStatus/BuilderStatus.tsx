import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { isActive } from '@/app/collective-rewards/active-builders'
import { BuilderState } from '@/app/collective-rewards/types'
import { Address } from 'viem'
import { BuilderStatusView } from './BuilderStatusView'
import { useHandleErrors } from '@/app/collective-rewards/utils'

interface BuilderStatusProps {
  address: Address | undefined
}

export function BuilderStatus({ address }: BuilderStatusProps) {
  const { getBuilderByAddress, isLoading, error } = useBuilderContext()

  useHandleErrors({ error, title: 'Error loading builder status' })

  const builder = address ? getBuilderByAddress(address) : undefined

  const builderState: BuilderState = !builder?.stateFlags
    ? 'inProgress'
    : isActive(builder.stateFlags)
      ? 'active'
      : 'inProgress'

  if (isLoading || !builder) {
    return null
  }

  return <BuilderStatusView builderState={builderState} />
}

export default BuilderStatus
