import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeTxFlow } from './executeTxFlow'
import { showToast, updateToast } from '@/shared/notification'
import { waitForTransactionReceipt } from '@wagmi/core'

vi.mock('@/shared/notification', () => ({
  showToast: vi.fn(),
  updateToast: vi.fn(),
}))

vi.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: vi.fn(),
}))

vi.mock('@/config', () => ({
  config: {},
}))

vi.mock('@/lib/sentry/sentry-client', () => ({
  sentryClient: { captureException: vi.fn() },
}))

const mockShowToast = vi.mocked(showToast)
const mockUpdateToast = vi.mocked(updateToast)
const mockWaitForTransactionReceipt = vi.mocked(waitForTransactionReceipt)

describe('executeTxFlow + real isUserRejectedTxError (DAO-2215)', () => {
  const mockOnRequestTx = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
  })

  it('should treat "hash is null" request errors like a user-dismissed tx (no error toast)', async () => {
    mockOnRequestTx.mockRejectedValue(new Error('hash is null'))
    const action = 'swap' as const

    await executeTxFlow({
      onRequestTx: mockOnRequestTx,
      action,
    })

    expect(mockShowToast).not.toHaveBeenCalled()
    expect(mockUpdateToast).not.toHaveBeenCalled()
    expect(mockWaitForTransactionReceipt).not.toHaveBeenCalled()
  })
})
