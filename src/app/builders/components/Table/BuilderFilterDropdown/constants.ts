import {
  BUILDER_ACTIVE,
  BUILDER_DEACTIVATED,
  BUILDER_IN_PROGRESS,
  BUILDER_KYC_REVOKED,
  BUILDER_PAUSED,
} from '@/app/collective-rewards/utils/isBuilderOperational'
import { BuilderState } from '../BuilderTable.config'

export type BuilderFilterOptionId = 'all' | Exclude<BuilderState, 'selfPaused'>

export type BuilderFilterOption = {
  id: BuilderFilterOptionId
  label: string
}

export const builderFilterOptions: BuilderFilterOption[] = [
  { id: 'all', label: 'All Builders' },
  { id: BUILDER_ACTIVE, label: 'Active Builders' },
  { id: BUILDER_DEACTIVATED, label: 'Deactivated Builders' },
  { id: BUILDER_KYC_REVOKED, label: 'Revoked Builders' },
  { id: BUILDER_PAUSED, label: 'Paused Builders' },
  { id: BUILDER_IN_PROGRESS, label: 'In Progress' },
]
