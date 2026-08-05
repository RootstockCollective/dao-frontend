import { useMemo } from 'react'
import { formatEther } from 'viem'
import { useGasPrice } from 'wagmi'

import Big from '@/lib/big'

/**
 * Gas limits for the two transactions staking actually needs — `approve` on RIF and
 * `depositAndDelegate` on stRIF — plus headroom for a few governance votes. The onboarding
 * tells the user they can back builders and vote once staked, so leaving them with exactly
 * enough gas to stake and nothing more would break that promise on their next click.
 *
 * Rounded up from observed usage on Rootstock.
 */
const GAS_APPROVE = 60_000n
const GAS_DEPOSIT_AND_DELEGATE = 250_000n
const GAS_VOTE = 120_000n
const VOTES_OF_HEADROOM = 3n

const TOTAL_GAS_UNITS = GAS_APPROVE + GAS_DEPOSIT_AND_DELEGATE + GAS_VOTE * VOTES_OF_HEADROOM

/**
 * Gas prices on Rootstock are low but not fixed. Asking for too little is the expensive
 * mistake: the user tops up exactly what we told them, comes back, and still fails on
 * approve. Asking for slightly too much costs them nothing.
 */
const SAFETY_FACTOR = 2n

/** The figure is rounded UP to this many places, so the copy never promises less than the gate demands. */
const DISPLAY_DECIMALS = 4

/**
 * Used when the node will not give us a gas price. Deliberately generous, and the value the
 * design was drawn with.
 */
const FALLBACK_MIN_GAS = '0.0002'

/**
 * A ceiling on what we will ever ask for. One bad gas-price reading should not tell someone
 * they need an absurd amount of rBTC before they can stake.
 */
const MAX_MIN_GAS = '0.001'

interface UseMinGasForStakingReturn {
  /** Minimum rBTC to both recommend in copy and gate on, as a decimal string. */
  minGas: string
  /** True while the gas price is in flight. Callers must not freeze a step list until this settles. */
  isLoading: boolean
  /** True when `minGas` is the constant fallback rather than a live estimate. */
  isFallback: boolean
}

/**
 * The minimum rBTC a user needs before staking is worth starting.
 *
 * Single source for both the gate and the copy: the modal must never show a number that
 * differs from the threshold it actually enforces.
 */
export const useMinGasForStaking = (): UseMinGasForStakingReturn => {
  const { data: gasPrice, isLoading, isError } = useGasPrice()

  return useMemo(() => {
    if (isLoading) {
      return { minGas: FALLBACK_MIN_GAS, isLoading: true, isFallback: false }
    }

    if (isError || !gasPrice) {
      return { minGas: FALLBACK_MIN_GAS, isLoading: false, isFallback: true }
    }

    const estimate = Big(formatEther(TOTAL_GAS_UNITS * gasPrice * SAFETY_FACTOR))
    const capped = estimate.gt(MAX_MIN_GAS) ? Big(MAX_MIN_GAS) : estimate

    return {
      // Rounding mode 3 rounds away from zero, so a tiny estimate still lands on a
      // non-zero figure rather than displaying "0 rBTC".
      minGas: capped.toFixedNoTrailing(DISPLAY_DECIMALS, 3),
      isLoading: false,
      isFallback: false,
    }
  }, [gasPrice, isLoading, isError])
}
