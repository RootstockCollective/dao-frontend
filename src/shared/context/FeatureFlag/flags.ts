const features = {
  user_flags: 'Allows users to enable certain flags',
  v2_rewards: 'Brings voting to builders',
  v3_design: 'Use the new v3 koto-based design',
} as const
export type Feature = keyof typeof features
export const getFeatures = (): Feature[] => [...Object.keys(features)] as Feature[]
export type FeatureFlags = {
  [Key in Feature]?: boolean
}
export const isFeatureFlag = (flag: Feature): flag is Feature => !!features[flag]

const userFlags = ['v2_rewards'] as const
export type UserFlag = (typeof userFlags)[number]
export type UserFlags = {
  [Key in UserFlag]?: boolean
}
export const getUserFlags = (): UserFlag[] => [...userFlags]

export const isUserFeatureFlag = (flag: UserFlag): flag is UserFlag => userFlags.includes(flag)

export const validateUserFlags = (flags: Record<string, any>): flags is UserFlags => {
  return Object.keys(flags).every(key => {
    return userFlags.includes(key as UserFlag) && typeof flags[key] === 'boolean'
  })
}

const getEnvFlag = (value?: string): boolean | undefined => {
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
}

export const envFlags: FeatureFlags = {
  user_flags: getEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS),
  v2_rewards: getEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_V2_REWARDS),
  v3_design: getEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_V3_DESIGN),
}
