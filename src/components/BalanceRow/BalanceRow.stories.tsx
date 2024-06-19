import type { Meta, StoryObj } from '@storybook/react'
import { FaBitcoin } from 'react-icons/fa'
import { BalanceRow } from './BalanceRow'
import { userEvent, within, expect, spyOn } from '@storybook/test'

const meta = {
  title: 'Components/BalanceRow',
  component: BalanceRow,
} satisfies Meta<typeof BalanceRow>

export default meta

type Story = StoryObj<typeof meta>

export const WithNoActions: Story = {
  args: {
    icon: <FaBitcoin />,
    label: 'RBTC BALANCE:',
    amount: '0.00000400',
  },
}

export const WithOneAction: Story = {
  args: {
    icon: <FaBitcoin />,
    label: 'RBTC BALANCE:',
    amount: '0.00000400',
    actions: [{ label: 'DISPERSE', onClick: () => console.log('DISPERSE') }],
  },
}

export const WithTwoActions: Story = {
  args: {
    icon: <FaBitcoin />,
    label: 'RBTC BALANCE:',
    amount: '0.00000400',
    actions: [
      { label: 'MINT', onClick: () => console.log('MINT') },
      { label: 'BURN', onClick: () => console.log('BURN') },
    ],
  },
}

export const Tested: Story = {
  args: {
    icon: <FaBitcoin />,
    label: 'RBTC BALANCE:',
    amount: '0.00000400',
    actions: [
      { label: 'MINT', onClick: () => console.log('MINT') },
      { label: 'BURN', onClick: () => console.log('BURN') },
    ],
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
