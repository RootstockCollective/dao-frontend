'use client'

import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react'
import {
  type BaseFlags,
  type FeatureFlag,
  type FeatureFlags,
  getEnvFlags,
  validateUserFlags,
} from './flags.utils'

type FeatureFlagContextType = {
  flags: FeatureFlags
  toggleFlag: (flagName: FeatureFlag) => void
  updateFlags: (newFlags: BaseFlags) => void
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

const readLocalStorage = (): Partial<FeatureFlags> => {
  if (typeof window !== 'undefined' && !!window.localStorage) {
    const storageItem = window.localStorage.getItem('features')

    if (!storageItem || storageItem.trim() === '') {
      return {}
    }

    const stored = JSON.parse(storageItem)
    // Filter out user_flags from localStorage if present, as it should only come from env
    const { user_flags, ...flags } = stored

    return flags
  }

  return {}
}

export const FeatureFlagProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(() => getEnvFlags())

  useEffect(() => {
    const localStorageFlags = readLocalStorage()
    const cleanEnvFlags = Object.entries(getEnvFlags()).reduce<FeatureFlags>(
      (acc, [key, value]) =>
        value === undefined
          ? acc
          : {
              ...acc,
              [key]: key === 'user_flags' ? (value as FeatureFlag[]) : (value as boolean),
            },
      {} as FeatureFlags,
    )

    const { user_flags, ...envFlags } = getEnvFlags()

    const allFlags: FeatureFlags = {
      ...cleanEnvFlags, // first set all user flags defined in env to true
      ...localStorageFlags, // then overwrite these with user-defined values
      ...envFlags, // finally let env flags to have the final word
    }
    setFlags(allFlags)
    updateLocalStorage(allFlags)
  }, [])

  const toggleFlag = (flag: FeatureFlag) => {
    if (flags.user_flags?.includes(flag)) {
      const updatedFlags: FeatureFlags = {
        ...flags,
        [flag]: !flags[flag],
      }
      setFlags(updatedFlags)
      updateLocalStorage(updatedFlags)
    }
  }

  const updateFlags = (newFlags: BaseFlags) => {
    if (!!flags.user_flags && validateUserFlags(newFlags)) {
      const updatedFlags: FeatureFlags = {
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
