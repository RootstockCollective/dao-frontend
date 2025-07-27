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
  content: string
}

export const builderFilterOptions: BuilderFilterOption[] = [
  { id: 'all', content: 'All Builders' },
  { id: BUILDER_ACTIVE, content: 'Active Builders' },
  { id: BUILDER_DEACTIVATED, content: 'Deactivated Builders' },
  { id: BUILDER_KYC_REVOKED, content: 'Revoked Builders' },
  { id: BUILDER_PAUSED, content: 'Paused Builders' },
  { id: BUILDER_IN_PROGRESS, content: 'In Progress' },
]
