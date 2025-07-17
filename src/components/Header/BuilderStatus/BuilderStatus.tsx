import { useBuilderContext } from '@/app/collective-rewards/user/context/BuilderContext'
import { isActive } from '@/app/collective-rewards/active-builders'
import { BuilderState } from '@/app/collective-rewards/types'
import { useMemo } from 'react'
import { Address } from 'viem'
import { BuilderStatusView } from './BuilderStatusView'
import { useHandleErrors } from '@/app/collective-rewards/utils'

interface BuilderStatusProps {
  address: Address | undefined
}

export function BuilderStatus({ address }: BuilderStatusProps) {
  const { getBuilderByAddress, isLoading, error } = useBuilderContext()

  useHandleErrors({ error, title: 'Error loading builder status' })

  const builder = useMemo(() => {
    if (!address) {
      return undefined
    }
    return getBuilderByAddress(address)
  }, [address, getBuilderByAddress])

  const builderState: BuilderState = useMemo(() => {
    if (!builder?.stateFlags) {
      return 'inProgress'
    }

    return isActive(builder.stateFlags) ? 'active' : 'inProgress'
  }, [builder?.stateFlags])

  if (isLoading || !builder) {
    return null
  }

  return <BuilderStatusView builderState={builderState} />
}

export default BuilderStatus
