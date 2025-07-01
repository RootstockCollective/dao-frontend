import type { Meta, StoryObj } from '@storybook/react'
import { DelegateCard } from './DelegateCard'
import { Address } from 'viem'

const meta: Meta<typeof DelegateCard> = {
  title: 'KOTO/DAO/DelegateCard',
  component: DelegateCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DelegateCard>

const defaultProps = {
  address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb29266' as Address,
  name: 'Boltz',
  since: 'Jan 2023',
  votingPower: '125,000',
  votingWeight: '12.5%',
  totalVotes: '450',
  delegators: '89',
  onDelegate: () => {},
}

export const Default: Story = {
  args: defaultProps,
}

export const LongName: Story = {
  args: {
    ...defaultProps,
    name: 'Dr. Alexandra Richardson-Montgomery III',
  },
}

export const HighNumbers: Story = {
  args: {
    ...defaultProps,
    votingPower: '1,250,000',
    votingWeight: '25.8%',
    totalVotes: '1,450',
    delegators: '289',
  },
}

export const NewDelegate: Story = {
  args: {
    ...defaultProps,
    since: 'Dec 2023',
    votingPower: '5,000',
    votingWeight: '0.5%',
    totalVotes: '12',
    delegators: '3',
  },
}

export const WithoutName: Story = {
  args: {
    ...defaultProps,
    name: '',
  },
}
