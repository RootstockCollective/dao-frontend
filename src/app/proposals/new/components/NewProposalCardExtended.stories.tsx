import type { Meta, StoryObj } from '@storybook/nextjs'
import { NewProposalCardExtended } from './NewProposalCardExtended'
import { newProposalCards, type NewProposalCardData } from '../newProposalCards.data'
import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Button } from '@/components/Button'

const meta: Meta<typeof NewProposalCardExtended> = {
  title: 'Proposals/NewProposalCardExtended',
  component: NewProposalCardExtended,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const Card = ({ card }: { card: NewProposalCardData }) => {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <Button onClick={() => setVisible(v => !v)}>{visible ? 'Hide' : 'Show'}</Button>
      <AnimatePresence>
        {visible && <NewProposalCardExtended card={card} cancelCardSelection={() => setVisible(false)} />}
      </AnimatePresence>
    </div>
  )
}

export const Grant: Story = {
  args: {
    card: newProposalCards.at(0),
  },
  render: args => <Card card={args.card} />,
}

export const BuildersRewards: Story = {
  args: {
    card: newProposalCards.at(1),
  },
  render: args => <Card card={args.card} />,
}
