import { BuilderState } from '../components/Table/BuilderTable.config'

export type BuilderFilterOptionId = 'all' | Exclude<BuilderState, 'selfPaused'>

export type BuilderFilterOption = {
  id: BuilderFilterOptionId
  content: string
}

export const builderFilterOptions: BuilderFilterOption[] = [
  { id: 'all', content: 'All Builders' },
  { id: 'active', content: 'Active Builders' },
  { id: 'deactivated', content: 'Deactivated Builders' },
  { id: 'kycRevoked', content: 'Revoked Builders' },
  { id: 'paused', content: 'Paused Builders' },
  { id: 'inProgress', content: 'In Progress' },
]
