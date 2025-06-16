import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { waitForTx } from './waitForTx'
import { showToast, updateToast } from '@/shared/notification'
import { waitForTransactionReceipt } from '@wagmi/core'
import { isUserRejectedTxError } from '@/components/ErrorPage/commonErrors'
import { TX_MESSAGES } from '@/shared/txMessages'
import { Hash } from 'viem'

// Mock dependencies
vi.mock('@/shared/notification', () => ({
  showToast: vi.fn(),
  updateToast: vi.fn(),
}))

vi.mock('@wagmi/core', () => ({
  waitForTransactionReceipt: vi.fn(),
}))

vi.mock('@/components/ErrorPage/commonErrors', () => ({
  isUserRejectedTxError: vi.fn(),
}))

vi.mock('@/config', () => ({
  config: {},
}))

const mockShowToast = vi.mocked(showToast)
const mockUpdateToast = vi.mocked(updateToast)
const mockWaitForTransactionReceipt = vi.mocked(waitForTransactionReceipt)
const mockIsUserRejectedTxError = vi.mocked(isUserRejectedTxError)

describe('waitForTx', () => {
  const mockTxHash = '0x1234567890abcdef1234567890abcdef12345678' as Hash
  const mockOnRequestTx = vi.fn()
  const mockOnSuccess = vi.fn()
  const mockConfig = {}

  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn() // Mock console.error to avoid noise in tests
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Success Path', () => {
    it('should handle successful transaction flow', async () => {
      // Arrange
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockResolvedValue({} as any)
      const action = 'staking' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        onSuccess: mockOnSuccess,
        action,
      })

      // Assert
      expect(mockOnRequestTx).toHaveBeenCalledOnce()
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].pending,
        dataTestId: `info-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
        hash: mockTxHash,
      })
      expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
        ...TX_MESSAGES[action].success,
        dataTestId: `success-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(mockOnSuccess).toHaveBeenCalledOnce()
      expect(result).toBe(mockTxHash)
    })

    it('should work without onSuccess callback', async () => {
      // Arrange
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockResolvedValue({} as any)
      const action = 'unstaking' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(mockOnRequestTx).toHaveBeenCalledOnce()
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].pending,
        dataTestId: `info-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
        hash: mockTxHash,
      })
      expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
        ...TX_MESSAGES[action].success,
        dataTestId: `success-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(result).toBe(mockTxHash)
    })
  })

  describe('Error Paths', () => {
    it('should handle transaction request failure', async () => {
      // Arrange
      const error = new Error('Transaction failed')
      mockOnRequestTx.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(false)
      const action = 'voting' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        onSuccess: mockOnSuccess,
        action,
      })

      // Assert
      expect(mockOnRequestTx).toHaveBeenCalledOnce()
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].error,
        dataTestId: 'error-tx',
        txHash: undefined,
        toastId: undefined,
      })
      expect(mockWaitForTransactionReceipt).not.toHaveBeenCalled()
      expect(mockUpdateToast).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Error requesting voting tx', error)
      expect(result).toBeUndefined()
    })

    it('should handle transaction confirmation failure', async () => {
      // Arrange
      const error = new Error('Transaction confirmation failed')
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(false)
      const action = 'execution' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        onSuccess: mockOnSuccess,
        action,
      })

      // Assert
      expect(mockOnRequestTx).toHaveBeenCalledOnce()
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].pending,
        dataTestId: `info-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
        hash: mockTxHash,
      })
      expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
        ...TX_MESSAGES[action].error,
        dataTestId: `error-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(console.error).toHaveBeenCalledWith('Error requesting execution tx', error)
      expect(result).toBe(mockTxHash)
    })
  })

  describe('User Rejection Path', () => {
    it('should silently handle user-rejected transaction requests', async () => {
      // Arrange
      const error = new Error('User rejected transaction')
      mockOnRequestTx.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(true)
      const action = 'proposal' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        onSuccess: mockOnSuccess,
        action,
      })

      // Assert
      expect(mockOnRequestTx).toHaveBeenCalledOnce()
      expect(mockShowToast).not.toHaveBeenCalled()
      expect(mockWaitForTransactionReceipt).not.toHaveBeenCalled()
      expect(mockUpdateToast).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(console.error).not.toHaveBeenCalled()
      expect(result).toBeUndefined()
    })

    it('should silently handle user-rejected transaction confirmations', async () => {
      // Arrange
      const error = new Error('User rejected confirmation')
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(true)
      const action = 'delegation' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        onSuccess: mockOnSuccess,
        action,
      })

      // Assert
      expect(mockOnRequestTx).toHaveBeenCalledOnce()
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].pending,
        dataTestId: `info-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith(mockConfig, {
        hash: mockTxHash,
      })
      expect(mockUpdateToast).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(console.error).not.toHaveBeenCalled()
      expect(result).toBe(mockTxHash)
    })
  })

  describe('Toast Configuration', () => {
    it('should create correct toast configuration for pending state', async () => {
      // Arrange
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockResolvedValue({} as any)
      const action = 'allowance' as const

      // Act
      await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].pending,
        dataTestId: `info-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
    })

    it('should create correct toast configuration for success state', async () => {
      // Arrange
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockResolvedValue({} as any)
      const action = 'reclaiming' as const

      // Act
      await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
        ...TX_MESSAGES[action].success,
        dataTestId: `success-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
    })

    it('should create correct toast configuration for error state with txHash', async () => {
      // Arrange
      const error = new Error('Transaction failed')
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(false)
      const action = 'queuing' as const

      // Act
      await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
        ...TX_MESSAGES[action].error,
        dataTestId: `error-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
    })

    it('should create correct toast configuration for error state without txHash', async () => {
      // Arrange
      const error = new Error('Transaction failed')
      mockOnRequestTx.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(false)
      const action = 'voting' as const

      // Act
      await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].error,
        dataTestId: 'error-tx',
        txHash: undefined,
        toastId: undefined,
      })
    })
  })

  describe('Different Action Types', () => {
    it('should work with all supported action types', async () => {
      const actions: Array<keyof typeof TX_MESSAGES> = [
        'proposal',
        'staking',
        'unstaking',
        'queuing',
        'voting',
        'execution',
        'delegation',
        'reclaiming',
        'allowance',
      ]

      for (const action of actions) {
        // Arrange
        vi.clearAllMocks()
        mockOnRequestTx.mockResolvedValue(mockTxHash)
        mockWaitForTransactionReceipt.mockResolvedValue({} as any)

        // Act
        const result = await waitForTx({
          onRequestTx: mockOnRequestTx,
          action,
        })

        // Assert
        expect(mockOnRequestTx).toHaveBeenCalledOnce()
        expect(mockShowToast).toHaveBeenCalledWith({
          ...TX_MESSAGES[action].pending,
          dataTestId: `info-tx-${mockTxHash}`,
          txHash: mockTxHash,
          toastId: mockTxHash,
        })
        expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
          ...TX_MESSAGES[action].success,
          dataTestId: `success-tx-${mockTxHash}`,
          txHash: mockTxHash,
          toastId: mockTxHash,
        })
        expect(result).toBe(mockTxHash)
      }
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined txHash in error scenarios', async () => {
      // Arrange
      const error = new Error('Transaction failed')
      mockOnRequestTx.mockRejectedValue(error)
      mockIsUserRejectedTxError.mockReturnValue(false)
      const action = 'proposal' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(mockShowToast).toHaveBeenCalledWith({
        ...TX_MESSAGES[action].error,
        dataTestId: 'error-tx',
        txHash: undefined,
        toastId: undefined,
      })
      expect(result).toBeUndefined()
    })

    it('should handle different error types', async () => {
      // Arrange
      const networkError = new Error('Network error')
      mockOnRequestTx.mockResolvedValue(mockTxHash)
      mockWaitForTransactionReceipt.mockRejectedValue(networkError)
      mockIsUserRejectedTxError.mockReturnValue(false)
      const action = 'staking' as const

      // Act
      const result = await waitForTx({
        onRequestTx: mockOnRequestTx,
        action,
      })

      // Assert
      expect(console.error).toHaveBeenCalledWith('Error requesting staking tx', networkError)
      expect(mockUpdateToast).toHaveBeenCalledWith(mockTxHash, {
        ...TX_MESSAGES[action].error,
        dataTestId: `error-tx-${mockTxHash}`,
        txHash: mockTxHash,
        toastId: mockTxHash,
      })
      expect(result).toBe(mockTxHash)
    })
  })
})
