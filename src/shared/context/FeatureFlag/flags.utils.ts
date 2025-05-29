import { Feature, getFeatures } from '@/config/features.conf'

// Make user_flags a special case in the type
export type FeatureFlag = Exclude<Feature, 'user_flags'>

export type FeatureFlags = {
  [Key in FeatureFlag]?: boolean
} & {
  user_flags?: FeatureFlag[]
}

export type UserFlags = {
  [Key in FeatureFlag]?: boolean
}

export const isFeatureFlag = (flag: Feature): flag is FeatureFlag => getFeatures().includes(flag)

// Get available user flags from environment variable or fallback to default
const getFlagListFromEnv = (value?: string): FeatureFlag[] => {
  if (!value) return []

  const envUserFlags = value?.split(',').map(flag => flag.trim() as FeatureFlag)
  if (!envUserFlags?.length) return []

  // Filter out any flags that aren't valid features and the user_flags itself
  return envUserFlags.filter(flag => isFeatureFlag(flag))
}

export const validateUserFlags = (flags: Record<string, any>): flags is UserFlags => {
  const availableFlags = envFlags.user_flags ?? []
  return Object.keys(flags).every(
    key => availableFlags.includes(key as FeatureFlag) && typeof flags[key] === 'boolean',
  )
}

const getBooleanEnvFlag = (value?: string): boolean | undefined => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }

  return undefined
}

const envFlags: FeatureFlags = {
  user_flags: getFlagListFromEnv(process.env.NEXT_PUBLIC_ENABLE_FEATUR_USER_FLAGS),
  v2_rewards: getBooleanEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_V2_REWARDS),
  v3_design: getBooleanEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_V3_DESIGN),
  the_graph: getBooleanEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_THE_GRAPH),
}

export const getEnvFlags = (): FeatureFlags => envFlags

export const getEnvFlag = (flag: FeatureFlag): boolean | undefined => envFlags[flag]
