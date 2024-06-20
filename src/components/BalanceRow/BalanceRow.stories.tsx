import type { Meta, StoryObj } from '@storybook/react'
import { expect, spyOn, userEvent, within } from '@storybook/test'
import { FaBitcoin } from 'react-icons/fa'
import { BalanceRow } from '../BalanceRow'

const meta = {
  title: 'Components/BalanceRow',
  component: BalanceRow.Root,
} satisfies Meta<typeof BalanceRow.Root>

export default meta

type Story = StoryObj<typeof meta>

export const WithNoActions: Story = {
  args: {
    children: (
      <>
        <BalanceRow.Icon icon={<FaBitcoin />} />
        <BalanceRow.Content>
          <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
          <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
        </BalanceRow.Content>
      </>
    ),
  },
}

export const WithOneAction: Story = {
  args: {
    children: (
      <>
        <BalanceRow.Icon icon={<FaBitcoin />} />
        <BalanceRow.Content>
          <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
          <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
        </BalanceRow.Content>
        <BalanceRow.ActionButtons>
          <BalanceRow.ActionButton onClick={() => console.log('DISPERSE')}>DISPERSE</BalanceRow.ActionButton>
        </BalanceRow.ActionButtons>
      </>
    ),
  },
}

export const WithTwoActions: Story = {
  args: {
    children: (
      <>
        <BalanceRow.Icon icon={<FaBitcoin />} />
        <BalanceRow.Content>
          <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
          <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
        </BalanceRow.Content>
        <BalanceRow.ActionButtons>
          <BalanceRow.ActionButton onClick={() => console.log('MINT')}>MINT</BalanceRow.ActionButton>
          <BalanceRow.ActionButton onClick={() => console.log('BURN')}>BURN</BalanceRow.ActionButton>
        </BalanceRow.ActionButtons>
      </>
    ),
  },
}

export const Tested: Story = {
  args: {
    children: (
      <>
        <BalanceRow.Icon icon={<FaBitcoin />} />
        <BalanceRow.Content>
          <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
          <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
        </BalanceRow.Content>
        <BalanceRow.ActionButtons>
          <BalanceRow.ActionButton onClick={() => console.log('MINT')}>MINT</BalanceRow.ActionButton>
          <BalanceRow.ActionButton onClick={() => console.log('BURN')}>BURN</BalanceRow.ActionButton>
        </BalanceRow.ActionButtons>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const spy = spyOn(console, 'log')

    const canvas = within(canvasElement)
    const button1 = canvas.getByText('MINT')
    const button2 = canvas.getByText('BURN')

    await userEvent.click(button1)
    expect(spy).toHaveBeenCalledWith('MINT')

    await userEvent.click(button2)
    expect(spy).toHaveBeenCalledWith('BURN')

    spy.mockRestore()
  },
}
