import { Feature } from '@/config/features.conf'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('process', () => ({
  env: {
    NODE_ENV: 'test',
  },
}))

// Mock process.env
const mockEnv = vi.spyOn(process, 'env', 'get')

const FAKE_FEATURE_1 = 'fake_feature1' as Feature
const FAKE_FEATURE_2 = 'fake_feature2' as Feature
const FAKE_FEATURE_3 = 'fake_feature3' as Feature
const USER_FLAGS_FEATURE = 'user_flags' as Feature
const FAKE_FEATURES = [FAKE_FEATURE_1, FAKE_FEATURE_2, FAKE_FEATURE_3, USER_FLAGS_FEATURE] as const

vi.mock('@/config/features.conf', async () => ({
  getFeatures: () => [...FAKE_FEATURES],
  USER_FLAGS_FEATURE: 'user_flags',
}))

describe('Feature Flags', () => {
  beforeEach(async () => {
    vi.resetModules()
    mockEnv.mockReset()
    mockEnv.mockReturnValue({ NODE_ENV: 'test' })

    // Clear module cache to ensure fresh imports
    vi.clearAllMocks()
    await vi.dynamicImportSettled()
  })

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('isFeatureFlag', () => {
    it('should return true for valid features', async () => {
      const { isFeatureFlag } = await import('./flags.utils')
      expect(isFeatureFlag(USER_FLAGS_FEATURE)).toBe(false)
      expect(isFeatureFlag(FAKE_FEATURE_1)).toBe(true)
      expect(isFeatureFlag(FAKE_FEATURE_2)).toBe(true)
      expect(isFeatureFlag(FAKE_FEATURE_3)).toBe(true)
    })

    it('should return false for invalid features', async () => {
      const { isFeatureFlag } = await import('./flags.utils')
      expect(isFeatureFlag('invalid_flag' as Feature)).toBe(false)
    })
  })

  describe('Available User Flags', () => {
    it('should be empty array when user_flags feature is undefined', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: undefined,
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(Array.isArray(envFlags.user_flags)).toBe(true)
      expect(envFlags.user_flags).toEqual([])
    })

    it('should be empty array when user_flags feature is empty string', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: '',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(Array.isArray(envFlags.user_flags)).toBe(true)
      expect(envFlags.user_flags).toEqual([])
    })

    it('should parse comma-separated user flags', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'fake_feature1,fake_feature2',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(envFlags.user_flags).toContain('fake_feature1')
      expect(envFlags.user_flags).toContain('fake_feature2')
    })

    it('should filter out invalid flags and user_flags itself', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'fake_feature1,invalid_flag,user_flags,fake_feature2',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(envFlags.user_flags).toContain('fake_feature1')
      expect(envFlags.user_flags).toContain('fake_feature2')
      expect(envFlags.user_flags).not.toContain('invalid_flag')
      expect(envFlags.user_flags).not.toContain(USER_FLAGS_FEATURE)
    })
  })

  describe('validateUserFlags', () => {
    it('should validate flags that are in the available list', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'fake_feature1,fake_feature2',
      })

      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        fake_feature1: true,
        fake_feature2: false,
      }
      expect(validateUserFlags(flags)).toBe(true)
    })

    it('should reject flags that are not in the available list', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'fake_feature1,fake_feature2',
      })

      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        invalid_flag: true,
      }
      expect(validateUserFlags(flags)).toBe(false)
    })

    it('should reject non-boolean values', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'fake_feature1',
      })

      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        fake_feature1: 'true',
      }
      expect(validateUserFlags(flags)).toBe(false)
    })

    it('should reject user_flags as a user flag', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'user_flags',
      })

      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        user_flags: true,
      }
      expect(validateUserFlags(flags)).toBe(false)
    })

    it('should validate against empty available flags when user_flags is undefined', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: undefined,
      })

      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        fake_feature1: true,
      }
      expect(validateUserFlags(flags)).toBe(false)
    })
  })
})
