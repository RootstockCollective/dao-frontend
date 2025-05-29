import * as features from '@/config/features.conf'
import { Feature, USER_FLAGS_FEATURE } from '@/config/features.conf'
import * as constants from '@/lib/constants'
import { act, renderHook, waitFor } from '@testing-library/react'
import { FC, ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FeatureFlagProvider, useFeatureFlags } from './FeatureFlagContext'
import * as flagUtils from './flags.utils'

// Constants used in tests
const FAKE_FEATURE_1 = 'fake_feature1' as Feature
const FAKE_FEATURE_2 = 'fake_feature2' as Feature
const FAKE_FEATURE_3 = 'fake_feature3' as Feature

type FakeFeature =
  | typeof FAKE_FEATURE_1
  | typeof FAKE_FEATURE_2
  | typeof FAKE_FEATURE_3
  | typeof USER_FLAGS_FEATURE

vi.mock('./flags.utils', async () => {
  const actual = await vi.importActual<typeof flagUtils>('./flags.utils')
  return {
    ...actual,
    isFeatureFlag: vi.fn(),
    getEnvFlags: vi.fn(),
  }
})

vi.mock('@/lib/constants', async () => {
  const actual = await vi.importActual('@/lib/constants')
  return {
    ...actual,
    getFeatureEnvFlags: vi.fn(),
  }
})

vi.mock('@/config/features.conf', async () => {
  const actual = await vi.importActual('@/config/features.conf')
  return {
    ...actual,
    USER_FLAGS_FEATURE: actual.USER_FLAGS_FEATURE,
    getFeatures: vi.fn(),
  }
})

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

const mockGetFeatures = vi.mocked(features.getFeatures)
const mockGetFeatureEnvFlags = vi.mocked(constants.getFeatureEnvFlags)
const mockGetEnvFlags = vi.mocked(flagUtils.getEnvFlags)
const mockIsFeatureFlag = vi.mocked(flagUtils.isFeatureFlag)

// Wrapper component for testing hooks
const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
  <FeatureFlagProvider>{children}</FeatureFlagProvider>
)

type FakeFeatureFlags = Record<
  FakeFeature,
  flagUtils.FeatureFlags extends typeof USER_FLAGS_FEATURE ? string[] : string
>

const setEnvFlags = (flags: FakeFeatureFlags) => {
  const { [USER_FLAGS_FEATURE]: userFlags, ...rest } = flags
  mockGetFeatures.mockReturnValue([...Object.keys(flags)] as Feature[])
  mockGetFeatureEnvFlags.mockReturnValue({
    ...rest,
    [USER_FLAGS_FEATURE]: (userFlags as unknown as string[]).join(','),
  } as Record<Feature, string>)
  mockGetEnvFlags.mockReturnValue(flags as unknown as flagUtils.FeatureFlags)
  mockIsFeatureFlag.mockImplementation(feature => {
    return Object.keys(flags).includes(feature as FakeFeature)
  })
}

describe('FeatureFlagContext', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockLocalStorage.getItem.mockReset()
    mockLocalStorage.setItem.mockReset()
    mockGetEnvFlags.mockReset()
    setEnvFlags({
      [FAKE_FEATURE_1]: true,
      [FAKE_FEATURE_2]: false,
      [FAKE_FEATURE_3]: true,
      [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1, FAKE_FEATURE_2],
    } as unknown as FakeFeatureFlags)
  })

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with env flags', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      setEnvFlags({
        [FAKE_FEATURE_1]: true,
        [FAKE_FEATURE_2]: false,
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1, FAKE_FEATURE_2],
      } as unknown as FakeFeatureFlags)

      const envFlags = flagUtils.getEnvFlags()

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true)
        expect(result.current.flags[USER_FLAGS_FEATURE]).toContain(FAKE_FEATURE_1)
        expect(result.current.flags[USER_FLAGS_FEATURE]).toContain(FAKE_FEATURE_2)
        expect(result.current.flags[FAKE_FEATURE_2]).toBe(false)
        expect(result.current.flags[FAKE_FEATURE_3]).toBeUndefined()
      })
    })

    it('should merge localStorage flags with env flags', async () => {
      mockGetEnvFlags.mockReturnValue({
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1, FAKE_FEATURE_2, FAKE_FEATURE_3],
        [FAKE_FEATURE_1]: true,
        [FAKE_FEATURE_3]: false,
      } as flagUtils.FeatureFlags)

      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          fake_feature1: false, // This should be overwritten by env flag
          fake_feature2: true, // This should be kept as it's a user flag
          fake_feature3: true, // This should be overwritten by env flag
        }),
      )

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[USER_FLAGS_FEATURE]).toContain(FAKE_FEATURE_1)
        expect(result.current.flags[USER_FLAGS_FEATURE]).toContain(FAKE_FEATURE_2)
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true) // From env
        expect(result.current.flags[FAKE_FEATURE_2]).toBe(true) // From localStorage
        expect(result.current.flags[FAKE_FEATURE_3]).toBe(false) // From env
      })
    })

    it('should ignore user flags in localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue(
        JSON.stringify({
          [USER_FLAGS_FEATURE]: [FAKE_FEATURE_3], // This should be ignored
          fake_feature1: true,
        }),
      )

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[USER_FLAGS_FEATURE]).not.toContain(FAKE_FEATURE_3)
        expect(result.current.flags[USER_FLAGS_FEATURE]).toContain(FAKE_FEATURE_1)
        expect(result.current.flags[USER_FLAGS_FEATURE]).toContain(FAKE_FEATURE_2)
      })
    })
  })

  describe('toggleFlag', () => {
    it('should toggle user flags', async () => {
      setEnvFlags({
        [FAKE_FEATURE_1]: true,
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1],
      } as unknown as FakeFeatureFlags)

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true)
      })

      act(() => {
        result.current.toggleFlag(FAKE_FEATURE_1 as flagUtils.FeatureFlag)
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(false)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'features',
          expect.stringContaining('"fake_feature1":false'),
        )
      })
    })

    it('should not change non-user flags when toggling', async () => {
      setEnvFlags({
        [FAKE_FEATURE_1]: true,
        [FAKE_FEATURE_2]: undefined,
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_2],
      } as unknown as FakeFeatureFlags)

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toEqual(true)
      })

      act(() => {
        result.current.toggleFlag(FAKE_FEATURE_3 as flagUtils.FeatureFlag)
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1], 'should not change').toEqual(true)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'features',
          expect.stringContaining('"fake_feature1":true'),
        )
      })
    })
  })

  describe('updateFlags', () => {
    it('should update multiple user flags', async () => {
      setEnvFlags({
        [FAKE_FEATURE_1]: true,
        [FAKE_FEATURE_2]: undefined,
        [FAKE_FEATURE_3]: true,
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1, FAKE_FEATURE_2],
      } as unknown as FakeFeatureFlags)

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true)
        expect(result.current.flags[FAKE_FEATURE_2]).toBe(undefined)
        expect(result.current.flags[FAKE_FEATURE_3]).toBe(true)
      })

      act(() => {
        result.current.updateFlags({
          [FAKE_FEATURE_1]: false,
          [FAKE_FEATURE_2]: true,
        } as flagUtils.BaseFlags)
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(false)
        expect(result.current.flags[FAKE_FEATURE_2]).toBe(true)
        expect(result.current.flags[FAKE_FEATURE_3]).toBe(true)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'features',
          expect.stringContaining('"fake_feature1":false'),
        )
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'features',
          expect.stringContaining('"fake_feature2":true'),
        )
      })
    })

    it('should not update if any flag is invalid', async () => {
      setEnvFlags({
        [FAKE_FEATURE_1]: true,
        [FAKE_FEATURE_2]: undefined,
        [FAKE_FEATURE_3]: true,
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1, FAKE_FEATURE_2],
      } as unknown as FakeFeatureFlags)

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true)
        expect(result.current.flags[FAKE_FEATURE_2]).toBe(undefined)
        expect(result.current.flags[FAKE_FEATURE_3]).toBe(true)
      })

      const initialFlags = { ...result.current.flags }

      act(() => {
        result.current.updateFlags({
          fake_feature1: false,
          fake_feature2: true,
          fake_feature3: false,
        } as any)
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true)
        expect(result.current.flags[FAKE_FEATURE_2]).toBe(undefined)
        expect(result.current.flags[FAKE_FEATURE_3]).toBe(true)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'features',
          expect.stringContaining('"fake_feature1":true'),
        )
      })
    })

    it('should not update if values are not boolean', async () => {
      setEnvFlags({
        [FAKE_FEATURE_1]: true,
        [FAKE_FEATURE_2]: undefined,
        [FAKE_FEATURE_3]: true,
        [USER_FLAGS_FEATURE]: [FAKE_FEATURE_1, FAKE_FEATURE_2],
      } as unknown as FakeFeatureFlags)

      const { result } = renderHook(() => useFeatureFlags(), {
        wrapper: Wrapper,
      })

      await waitFor(() => {
        expect(result.current.flags[FAKE_FEATURE_1]).toBe(true)
      })

      const initialFlags = { ...result.current.flags }

      act(() => {
        result.current.updateFlags({
          fake_feature1: 'true' as any,
        } as flagUtils.BaseFlags)
      })

      await waitFor(() => {
        expect(result.current.flags).toEqual(initialFlags)
        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'features',
          expect.stringContaining('"fake_feature1":true'),
        )
      })
    })
  })
})
