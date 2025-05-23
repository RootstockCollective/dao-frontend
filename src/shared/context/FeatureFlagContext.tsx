import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'

export const features = {
  user_flags: 'Allows users to enable certain flags',
  v2_rewards: 'Brings voting to builders',
  use_the_graph: 'Use the graph to fetch event data',
} as const
export type Feature = keyof typeof features

export const userFlags = ['v2_rewards'] as const

export type UserFlag = (typeof userFlags)[number]

export const isUserFeatureFlag = (flag: UserFlag): flag is UserFlag => userFlags.includes(flag)

export type FeatureFlags = {
  [Key in Feature]?: boolean
}
export type UserFlags = {
  [Key in UserFlag]?: boolean
}

export const isFeatureFlag = (flag: Feature): flag is Feature => !!features[flag]

export const validateUserFlags = (flags: Record<string, any>): flags is UserFlags => {
  return Object.keys(flags).every(key => {
    return userFlags.includes(key as UserFlag) && typeof flags[key] === 'boolean'
  })
}

const getEnvFlag = (value?: string | boolean): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value
  }
  if (value === 'true') {
    return true
  }
  if (value === 'false') {
    return false
  }
  return undefined
}
export const envFlags: FeatureFlags = {
  user_flags: getEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS),
  v2_rewards: getEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_V2_REWARDS),
  use_the_graph: getEnvFlag(process.env.NEXT_PUBLIC_ENABLE_FEATURE_USE_THE_GRAPH),
}
type FeatureFlagContextType = {
  flags: FeatureFlags
  toggleFlag: (flagName: UserFlag) => void
  updateFlags: (newFlags: UserFlags) => void
}
const FeatureFlagContext = createContext<FeatureFlagContextType>({
  flags: {} as FeatureFlags,
  toggleFlag: () => {},
  updateFlags: () => {},
})

const updateLocalStorage = (features: FeatureFlags): void => {
  if (typeof window !== 'undefined' && !!window.localStorage) {
    window.localStorage.setItem('features', JSON.stringify(features))
  }
}

const readLocalStorage = (): FeatureFlags => {
  if (typeof window !== 'undefined' && !!window.localStorage) {
    return JSON.parse(window.localStorage.getItem('features') ?? '{}')
  }
  return {}
}

export const FeatureFlagProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(envFlags)
  useEffect(() => {
    const localStorageFlags = readLocalStorage()
    const cleanEnvFlags: FeatureFlags = Object.entries(envFlags).reduce<FeatureFlags>((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key as Feature] = value
      }

      return acc
    }, {})
    const allFlags: FeatureFlags = { ...envFlags, ...localStorageFlags, ...cleanEnvFlags }

    setFlags(allFlags)
    updateLocalStorage(allFlags)
  }, [])

  const toggleFlag = (flag: UserFlag) => {
    if (flags.user_flags && isUserFeatureFlag(flag)) {
      const updatedFlags = {
        ...flags,
        [flag]: !flags[flag],
      }
      setFlags(updatedFlags)
      updateLocalStorage(updatedFlags)
    }
  }

  const updateFlags = (newFlags: UserFlags) => {
    if (flags.user_flags && validateUserFlags(newFlags)) {
      const updatedFlags = {
        ...flags,
        ...newFlags,
      }
      setFlags(updatedFlags)
      updateLocalStorage(updatedFlags)
    }
  }

  return (
    <FeatureFlagContext.Provider value={{ flags, updateFlags, toggleFlag }}>
      {children}
    </FeatureFlagContext.Provider>
  )
}

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('FeatureFlagContext not found. Use FeatureFlagProvider to wrap your app.')
  }
  return context
}
