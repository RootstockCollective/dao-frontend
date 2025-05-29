import { Feature } from '@/config/features.conf'
import { cleanup, render } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFeatureFlags } from './FeatureFlagContext'
import type { FeatureFlag } from './flags.utils'
import { withFeatureFlag } from './withFeatureFlag'

// Constants used in tests
const FAKE_FEATURE = 'v2_rewards' as Feature

vi.mock('next/navigation', async () => ({
  useRouter: vi.fn(),
}))

vi.mock('./FeatureFlagContext', async () => ({
  useFeatureFlags: vi.fn(),
}))

const mockUseRouter = vi.mocked(useRouter)
const mockUseFeatureFlags = vi.mocked(useFeatureFlags)

describe('withFeatureFlag HOC', () => {
  // Test component
  const TestComponent = () => <div>Test Component</div>
  TestComponent.displayName = 'TestComponent'

  // Mock router
  const mockPush = vi.fn()
  const mockRouter = {
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockUseRouter.mockReset()
    mockUseFeatureFlags.mockReset()
    mockPush.mockReset()
    mockUseRouter.mockReturnValue(mockRouter)
  })

  afterEach(() => {
    cleanup()
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('Feature Enabled', () => {
    beforeEach(() => {
      mockUseFeatureFlags.mockReturnValue({
        flags: { [FAKE_FEATURE]: true },
        toggleFlag: vi.fn(),
        updateFlags: vi.fn(),
      })
    })

    it('should render the wrapped component', () => {
      const WrappedComponent = withFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
      })

      const { container } = render(<WrappedComponent />)
      expect(container).toHaveTextContent('Test Component')
    })

    it('should pass props to the wrapped component', () => {
      const PropsTestComponent = ({ text }: { text: string }) => <div>{text}</div>
      const WrappedComponent = withFeatureFlag(PropsTestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
      })

      const { container } = render(<WrappedComponent text="Hello" />)
      expect(container).toHaveTextContent('Hello')
    })

    it('should preserve the display name', () => {
      const WrappedComponent = withFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
      })

      expect(WrappedComponent.displayName).toBe('WithFeatureFlag(TestComponent)')
    })
  })

  describe('Feature Disabled', () => {
    beforeEach(() => {
      mockUseFeatureFlags.mockReturnValue({
        flags: { [FAKE_FEATURE]: false },
        toggleFlag: vi.fn(),
        updateFlags: vi.fn(),
      })
    })

    it('should render fallback when feature is disabled', () => {
      const WrappedComponent = withFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
        fallback: <div>Fallback Content</div>,
      })

      const { container } = render(<WrappedComponent />)
      expect(container).toHaveTextContent('Fallback Content')
    })

    it('should redirect when redirectTo is provided', () => {
      const WrappedComponent = withFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
        redirectTo: '/redirect-path',
      })

      render(<WrappedComponent />)
      expect(mockPush).toHaveBeenCalledWith('/redirect-path')
    })
  })
})
