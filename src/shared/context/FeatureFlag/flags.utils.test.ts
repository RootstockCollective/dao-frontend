import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { FeatureFlag, isFeatureFlag } from './flags.utils'

// Mock process.env
const mockEnv = vi.spyOn(process, 'env', 'get')

describe('Feature Flags', () => {
  beforeEach(() => {
    vi.resetModules()
    mockEnv.mockReset()
    mockEnv.mockReturnValue({ NODE_ENV: 'test' })
  })

  afterEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('isFeatureFlag', () => {
    it('should return true for valid features', () => {
      expect(isFeatureFlag('user_flags')).toBe(false)
      expect(isFeatureFlag('v2_rewards')).toBe(true)
      expect(isFeatureFlag('v3_design')).toBe(true)
    })

    it('should return false for invalid features', () => {
      expect(isFeatureFlag('invalid_flag' as FeatureFlag)).toBe(false)
    })
  })

  describe('Available User Flags', () => {
    beforeEach(() => {
      vi.resetModules()
      mockEnv.mockReset()
      mockEnv.mockReturnValue({ NODE_ENV: 'test' })
    })

    it('should be undefined when user_flags feature is disabled', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'false',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(envFlags.user_flags).toBeUndefined()
    })

    it('should use default user flags when enabled but no flags specified', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'true',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(envFlags.user_flags).toEqual(['v2_rewards'])
    })

    it('should parse user flags from environment variable when enabled', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'true',
        NEXT_PUBLIC_AVAILABLE_USER_FLAGS: 'v2_rewards,v3_design',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(envFlags.user_flags).toContain('v2_rewards')
      expect(envFlags.user_flags).toContain('v3_design')
    })

    it('should filter out invalid flags and user_flags itself from environment variable', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'true',
        NEXT_PUBLIC_AVAILABLE_USER_FLAGS: 'v2_rewards,invalid_flag,user_flags,v3_design',
      })

      const { getEnvFlags } = await import('./flags.utils')
      const envFlags = getEnvFlags()
      expect(envFlags.user_flags).toContain('v2_rewards')
      expect(envFlags.user_flags).toContain('v3_design')
      expect(envFlags.user_flags).not.toContain('invalid_flag')
      expect(envFlags.user_flags).not.toContain('user_flags')
    })
  })

  describe('validateUserFlags', () => {
    beforeEach(() => {
      vi.resetModules()
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'true',
        NEXT_PUBLIC_AVAILABLE_USER_FLAGS: 'v2_rewards,v3_design',
      })
    })

    it('should validate flags that are in the available list', async () => {
      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        v2_rewards: true,
        v3_design: false,
      }
      expect(validateUserFlags(flags)).toBe(true)
    })

    it('should reject flags that are not in the available list', async () => {
      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        invalid_flag: true,
      }
      expect(validateUserFlags(flags)).toBe(false)
    })

    it('should reject non-boolean values', async () => {
      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        v2_rewards: 'true',
      }
      expect(validateUserFlags(flags)).toBe(false)
    })

    it('should reject user_flags as a user flag', async () => {
      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        user_flags: true,
      }
      expect(validateUserFlags(flags)).toBe(false)
    })

    it('should validate against empty available flags when user_flags is undefined', async () => {
      mockEnv.mockReturnValue({
        NODE_ENV: 'test',
        NEXT_PUBLIC_ENABLE_FEATURE_USER_FLAGS: 'false',
      })
      const { validateUserFlags } = await import('./flags.utils')
      const flags = {
        v2_rewards: true,
      }
      expect(validateUserFlags(flags)).toBe(false)
    })
  })
})
