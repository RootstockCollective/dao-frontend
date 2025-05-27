import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import {
  envFlags,
  Feature,
  FeatureFlags,
  isUserFeatureFlag,
  UserFlag,
  UserFlags,
  validateUserFlags,
} from './flags'

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

export const useFeatureFlags = () => useContext(FeatureFlagContext)
