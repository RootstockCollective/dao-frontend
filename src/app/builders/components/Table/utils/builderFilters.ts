import { Builder } from '@/app/collective-rewards/types'
import {
  isBuilderActive,
  isBuilderDeactivated,
  isBuilderInProgress,
  isBuilderKycRevoked,
  isBuilderPaused,
  isBuilderSelfPaused,
} from '@/app/collective-rewards/utils'
import { BuilderFilterOptionId } from '../BuilderFilterDropdown'

// Shared filter functions for builders
export const filterActive = (builder: Builder) => isBuilderActive(builder.stateFlags)
export const filterDeactivated = (builder: Builder) => isBuilderDeactivated(builder)
export const filterKycRevoked = (builder: Builder) => isBuilderKycRevoked(builder.stateFlags)
export const filterPaused = (builder: Builder) =>
  isBuilderPaused(builder.stateFlags) || isBuilderSelfPaused(builder.stateFlags)
export const filterInProgress = (builder: Builder) => isBuilderInProgress(builder)
export const filterAll = () => true

// Centralized filter map to avoid duplication
export const builderFilterMap: Record<BuilderFilterOptionId, (builder: Builder) => boolean> = {
  active: filterActive,
  deactivated: filterDeactivated,
  kycRevoked: filterKycRevoked,
  paused: filterPaused,
  inProgress: filterInProgress,
  all: filterAll,
}
