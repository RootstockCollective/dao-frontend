import { Feature } from '@/config/features.conf'
import { cleanup, render, screen } from '@testing-library/react'
import { redirect } from 'next/navigation'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { FeatureFlag } from './flags.utils'
import { getEnvFlag } from './flags.utils'
import { withServerFeatureFlag } from './withServerFeatureFlag'

// Constants used in tests
const FAKE_FEATURE = 'v2_rewards' as Feature

// Mock next/navigation
vi.mock('next/navigation', async () => ({
  redirect: vi.fn(),
}))

// Mock flags.utils
vi.mock('./flags.utils', async () => ({
  getEnvFlag: vi.fn(),
}))

const mockRedirect = vi.mocked(redirect)
const mockGetEnvFlag = vi.mocked(getEnvFlag)

describe('withServerFeatureFlag HOC', () => {
  // Test component
  const TestComponent = () => <div>Test Component</div>
  TestComponent.displayName = 'TestComponent'

  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    mockRedirect.mockReset()
    mockGetEnvFlag.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.resetModules()
    vi.clearAllMocks()
  })

  describe('Feature Enabled', () => {
    beforeEach(() => {
      mockGetEnvFlag.mockReturnValue(true)
    })

    it('should render the wrapped component', () => {
      const WrappedComponent = withServerFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
      })

      render(<WrappedComponent />)
      expect(screen.getByText('Test Component')).toBeInTheDocument()
    })

    it('should pass props to the wrapped component', () => {
      const PropsTestComponent = ({ text }: { text: string }) => <div>{text}</div>
      const WrappedComponent = withServerFeatureFlag(PropsTestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
      })

      const expectedText = 'Hello'
      render(<WrappedComponent text={expectedText} />)
      expect(screen.getByText(expectedText)).toBeInTheDocument()
    })

    it('should preserve the display name', () => {
      const WrappedComponent = withServerFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
      })

      expect(WrappedComponent.displayName).toBe('WithServerFeatureFlag(TestComponent)')
    })
  })

  describe('Feature Disabled', () => {
    beforeEach(() => {
      mockGetEnvFlag.mockReturnValue(false)
    })

    it('should render fallback when feature is disabled', () => {
      const WrappedComponent = withServerFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
        fallback: <div>Fallback Content</div>,
      })

      render(<WrappedComponent />)
      expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    })

    it('should redirect when redirectTo is provided', () => {
      const WrappedComponent = withServerFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
        redirectTo: '/redirect-path',
      })

      render(<WrappedComponent />)
      expect(mockRedirect).toHaveBeenCalledWith('/redirect-path')
    })
  })

  describe('Undefined Flag', () => {
    beforeEach(() => {
      mockGetEnvFlag.mockReturnValue(undefined)
    })

    it('should render fallback when flag is undefined', () => {
      const WrappedComponent = withServerFeatureFlag(TestComponent, {
        feature: FAKE_FEATURE as FeatureFlag,
        fallback: <div>Fallback Content</div>,
      })

      render(<WrappedComponent />)
      expect(screen.getByText('Fallback Content')).toBeInTheDocument()
    })
  })
})
