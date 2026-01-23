import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { USDT0, USDRIF, USDT0_USDRIF_POOL_ADDRESS } from '@/lib/constants'
import type { SwapStore, SwapState, SwapMode, SwapTokenSymbol } from './types'
import type { PermitSingle } from '@/lib/swap/permit2'
import type { Address, Hex } from 'viem'

// Default pool fee - 0.01% is most common for stablecoin pairs
const DEFAULT_POOL_FEE = 100

const initialState: SwapState = {
  // Token selection
  tokenIn: USDT0,
  tokenOut: USDRIF,

  // User input
  mode: 'exactIn',
  typedAmount: '',

  // Swap transaction state
  isSwapping: false,
  swapError: null,
  swapTxHash: null,

  // Approval state (loading state comes from wagmi's isPending)
  approvalTxHash: null,

  // Permit signing state (loading state comes from wagmi's isPending)
  permit: null,
  permitSignature: null,

  // Pool configuration
  poolAddress: USDT0_USDRIF_POOL_ADDRESS,
  poolFee: DEFAULT_POOL_FEE,
}

export const useSwapStore = create<SwapStore>()(
  devtools(
    set => ({
      ...initialState,

      // ─────────────────────────────────────────────────────────────────────
      // Token Selection
      // ─────────────────────────────────────────────────────────────────────

      setTokenIn: (token: SwapTokenSymbol) =>
        set(
          {
            tokenIn: token,
            typedAmount: '',
            swapError: null,
          },
          false,
          'setTokenIn',
        ),

      setTokenOut: (token: SwapTokenSymbol) =>
        set(
          {
            tokenOut: token,
            typedAmount: '',
            swapError: null,
          },
          false,
          'setTokenOut',
        ),

      toggleTokens: () =>
        set(
          state => ({
            tokenIn: state.tokenOut,
            tokenOut: state.tokenIn,
            typedAmount: '',
            swapError: null,
          }),
          false,
          'toggleTokens',
        ),

      // ─────────────────────────────────────────────────────────────────────
      // User Input
      // ─────────────────────────────────────────────────────────────────────

      setSwapInput: (mode: SwapMode, typedAmount: string) =>
        set(
          {
            mode,
            typedAmount,
            swapError: null,
          },
          false,
          'setSwapInput',
        ),

      // ─────────────────────────────────────────────────────────────────────
      // Swap Transaction Lifecycle
      // ─────────────────────────────────────────────────────────────────────

      startSwap: () =>
        set(
          {
            isSwapping: true,
            swapError: null,
            swapTxHash: null,
          },
          false,
          'startSwap',
        ),

      completeSwap: (txHash: string) =>
        set(
          {
            isSwapping: false,
            swapTxHash: txHash,
            swapError: null,
          },
          false,
          'completeSwap',
        ),

      failSwap: (error: Error) =>
        set(
          {
            isSwapping: false,
            swapError: error,
          },
          false,
          'failSwap',
        ),

      clearSwapError: () => set({ swapError: null }, false, 'clearSwapError'),

      // ─────────────────────────────────────────────────────────────────────
      // Approval (loading state comes from wagmi's isPending)
      // ─────────────────────────────────────────────────────────────────────

      setApprovalTxHash: (txHash: string | null) =>
        set({ approvalTxHash: txHash }, false, 'setApprovalTxHash'),

      // ─────────────────────────────────────────────────────────────────────
      // Permit Signing (loading state comes from wagmi's isPending)
      // ─────────────────────────────────────────────────────────────────────

      setPermitData: (permit: PermitSingle, signature: Hex) =>
        set(
          {
            permit,
            permitSignature: signature,
          },
          false,
          'setPermitData',
        ),

      clearPermitData: () =>
        set(
          {
            permit: null,
            permitSignature: null,
          },
          false,
          'clearPermitData',
        ),

      // ─────────────────────────────────────────────────────────────────────
      // Pool Configuration
      // ─────────────────────────────────────────────────────────────────────

      setPoolFee: (fee: number) => set({ poolFee: fee }, false, 'setPoolFee'),

      setPoolAddress: (address: Address) => set({ poolAddress: address }, false, 'setPoolAddress'),

      // ─────────────────────────────────────────────────────────────────────
      // Reset
      // ─────────────────────────────────────────────────────────────────────

      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'SwapStore' },
  ),
)
