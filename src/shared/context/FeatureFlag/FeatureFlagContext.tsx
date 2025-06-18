import { Feature, getFeatures, USER_FLAGS_FEATURE } from '@/config/features.conf'
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

const readLocalStorage = (item: string): Partial<FeatureFlags> => {
  if (typeof window !== 'undefined' && !!window.localStorage) {
    const storageItem = window.localStorage.getItem(item)

    if (!storageItem || storageItem.trim() === '') {
      return {}
    }

    let stored: Partial<FeatureFlags> = {}
    try {
      stored = JSON.parse(storageItem)
    } catch (error) {
      console.error('Error parsing localStorage', error)
    }

    return stored
  }

  return {}
}

export const cleanUserFlags = (userFlags: Partial<FeatureFlags>, features: Feature[]) => {
  const envFlags = getEnvFlags()
  return Object.entries(userFlags).reduce((acc, [key, value]) => {
    if (!features?.includes(key as FeatureFlag) || key == USER_FLAGS_FEATURE) {
      return acc
    }

    const flagOverride = envFlags[key as FeatureFlag]

    return {
      ...acc,
      [key as FeatureFlag]: flagOverride === undefined ? value : flagOverride,
    }
  }, {})
}

export const combineUserFlags = (userFlags: Partial<FeatureFlags>): FeatureFlags => {
  if (!getEnvFlags() || !userFlags) {
    return {}
  }
  return {
    ...cleanUserFlags(userFlags, getFeatures()),
    ...getEnvFlags(),
  }
}

export const FeatureFlagProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [flags, setFlags] = useState<FeatureFlags>(() => getEnvFlags())

  useEffect(() => {
    const localStorageFlags = readLocalStorage('features')
    const allFlags = combineUserFlags(localStorageFlags)

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

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagContext)
  if (!context) {
    throw new Error('FeatureFlagContext not found. Use FeatureFlagProvider to wrap your app.')
  }
  return context
}
