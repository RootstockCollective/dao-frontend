import { Feature, getFeatures, USER_FLAGS_FEATURE } from '@/config/features.conf'
import { getFeatureEnvFlags } from '@/lib/constants'

// Make user_flags a special case in the type
export type FeatureFlag = Exclude<Feature, typeof USER_FLAGS_FEATURE>

export type BaseFlags = {
  [Key in FeatureFlag]?: boolean
}

export type FeatureFlags = BaseFlags & {
  user_flags?: FeatureFlag[]
}

export const isFeatureFlag = (flag: Feature): flag is FeatureFlag =>
  getFeatures().includes(flag) && flag !== USER_FLAGS_FEATURE

// Get available user flags from environment variable or fallback to default
const getFlagListFromEnv = (value?: string): FeatureFlag[] => {
  if (!value) return []

  const envUserFlags = value?.split(',').map(flag => flag.trim() as FeatureFlag)
  if (!envUserFlags?.length) return []

  // Filter out any flags that aren't valid features and the user_flags itself
  return envUserFlags.filter(flag => isFeatureFlag(flag))
}

const getBooleanEnvFlag = (value?: string): boolean => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }

  return false
}

const loadEnvFlags = (): FeatureFlags => {
  const features = getFeatures()
  const envFlags = features.reduce<FeatureFlags>((acc, feature) => {
    const envFlag = getFeatureEnvFlags()[feature]

    if (feature === USER_FLAGS_FEATURE) {
      return {
        ...acc,
        [USER_FLAGS_FEATURE]: getFlagListFromEnv(envFlag),
      }
    }

    if (!envFlag || envFlag.toString().trim() === '') {
      return acc
    }

    return {
      ...acc,
      [feature]: getBooleanEnvFlag(envFlag),
    }
  }, {})

  return envFlags
}

export const getEnvFlags = (): FeatureFlags => loadEnvFlags()

export const getEnvFlag = (flag: FeatureFlag): boolean | undefined => loadEnvFlags()[flag]

export const validateUserFlags = (flags: Record<string, any>): flags is BaseFlags => {
  const allowedUserFlags = loadEnvFlags()[USER_FLAGS_FEATURE] ?? []
  return Object.keys(flags).every(key => {
    const isValid = allowedUserFlags.includes(key as FeatureFlag) && typeof flags[key] === 'boolean'
    return isValid
  })
}
