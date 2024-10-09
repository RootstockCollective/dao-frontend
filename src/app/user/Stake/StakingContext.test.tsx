import { expect, describe, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StakingProvider, useStakingContext } from './StakingContext'
import { StakingToken } from './types'

const TestComponent = ({ stakeAmount, id }: { stakeAmount: string; id: number }) => {
  const { amountDataToReceive, onAmountChange } = useStakingContext()
  return (
    <div>
      <span data-testid={`amountToReceive-${id}`}>{amountDataToReceive.amountToReceive}</span>
      <span data-testid={`amountToReceiveConvertedToCurrency-${id}`}>
        {amountDataToReceive.amountToReceiveConvertedToCurrency}
      </span>
      <button data-testid={`setAmountButton-${id}`} onClick={() => onAmountChange(stakeAmount)}>
        Set Amount
      </button>
    </div>
  )
}
const actionToUse = vi.fn()
actionToUse.mockClear()
const rif: Omit<StakingToken, 'price'> = {
  balance: '294.0',
  symbol: 'tRIF',
  contract: '0x19f64674d8a5b4e652319f5e239efd3bc969a1fe',
}
const stRif: Omit<StakingToken, 'price'> = {
  balance: '13.0',
  symbol: 'stRIF',
  contract: '0xC4b091d97AD25ceA5922f09fe80711B7ACBbb16f',
}
const actionName = 'STAKE'

describe('StakingProvider', () => {
  it('Amount to receive is a whole number if the stake amount is also a whole number and the token prices are equal', () => {
    const failingCases: string[] = []

    // running the test 500 times
    for (let i = 0; i < 500; i++) {
      // stake amount is a whole number
      const stakeAmount = i.toString()
      // StRif and Rif prices are equal
      const price = Math.random().toString()
      render(
        <StakingProvider
          tokenToSend={{ ...rif, price }}
          tokenToReceive={{ ...stRif, price }}
          actionToUse={actionToUse}
          actionName={actionName}
        >
          <TestComponent stakeAmount={stakeAmount} id={i} />
        </StakingProvider>,
      )

      fireEvent.click(screen.getByTestId(`setAmountButton-${i}`))
      const amountToReceive = screen.getByTestId(`amountToReceive-${i}`)
      // if amount to receive is not a whole number
      // or if the amount to receive is not equal to the stake amount
      if (amountToReceive.textContent?.includes('.') || stakeAmount !== amountToReceive.textContent) {
        failingCases.push(price)
      }
    }
    expect(failingCases.length).toBe(0)
  })
})
