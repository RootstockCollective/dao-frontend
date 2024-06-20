import type { Meta, StoryObj } from '@storybook/react'
import { expect, spyOn, userEvent, within } from '@storybook/test'
import { FaBitcoin } from 'react-icons/fa'
import { BalanceRow } from '../BalanceRow'
import { BalanceRows } from '.'

const meta = {
  title: 'Components/BalanceRows',
  component: BalanceRows,
} satisfies Meta<typeof BalanceRows>

export default meta

type Story = StoryObj<typeof meta>

export const Balances: Story = {
  args: {
    label: 'Balances',
    children: (
      <>
        <BalanceRow.Root>
          <BalanceRow.Icon icon={<FaBitcoin />} />
          <BalanceRow.Content>
            <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
            <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
          </BalanceRow.Content>
        </BalanceRow.Root>

        <BalanceRow.Root>
          <BalanceRow.Icon icon={<FaBitcoin />} />
          <BalanceRow.Content>
            <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
            <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
          </BalanceRow.Content>
          <BalanceRow.ActionButtons>
            <BalanceRow.ActionButton onClick={() => console.log('DISPERSE')}>
              DISPERSE
            </BalanceRow.ActionButton>
          </BalanceRow.ActionButtons>
        </BalanceRow.Root>

        <BalanceRow.Root>
          <BalanceRow.Icon icon={<FaBitcoin />} />
          <BalanceRow.Content>
            <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
            <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
          </BalanceRow.Content>
          <BalanceRow.ActionButtons>
            <BalanceRow.ActionButton onClick={() => console.log('DISPERSE')}>
              DISPERSE
            </BalanceRow.ActionButton>
          </BalanceRow.ActionButtons>
        </BalanceRow.Root>
      </>
    ),
  },
}

export const FeeShare: Story = {
  args: {
    label: 'Fee Share',
    children: (
      <>
      <BalanceRow.Root>
        <BalanceRow.Icon icon={<FaBitcoin />} />
        <BalanceRow.Content>
          <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
          <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
        </BalanceRow.Content>
        <BalanceRow.ActionButtons>
          <BalanceRow.ActionButton onClick={() => console.log('DISPERSE')}>
            DISPERSE
          </BalanceRow.ActionButton>
        </BalanceRow.ActionButtons>
      </BalanceRow.Root>

      <BalanceRow.Root>
        <BalanceRow.Icon icon={<FaBitcoin />} />
        <BalanceRow.Content>
          <BalanceRow.Label>RBTC BALANCE:</BalanceRow.Label>
          <BalanceRow.Amount>0.00000400</BalanceRow.Amount>
        </BalanceRow.Content>
        <BalanceRow.ActionButtons>
          <BalanceRow.ActionButton onClick={() => console.log('MINT')}>
            MINT
          </BalanceRow.ActionButton>
          <BalanceRow.ActionButton onClick={() => console.log('BURN')}>
            BURN
          </BalanceRow.ActionButton>
        </BalanceRow.ActionButtons>
      </BalanceRow.Root>
    </>
    )
  },

}
