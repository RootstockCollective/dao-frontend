import type { Meta, StoryObj } from '@storybook/react'
import { NewProposalCard } from './NewProposalCard'
import { newProposalCards, type NewProposalCardBaseData } from './newProposalCards.data'
import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Button } from '@/components/ButtonNew'

const meta: Meta<typeof NewProposalCard> = {
  title: 'Proposals/NewProposalCard',
  component: NewProposalCard,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

const Card = ({ card }: { card: NewProposalCardBaseData }) => {
  const [visible, setVisible] = useState(false)
  return (
    <div>
      <Button onClick={() => setVisible(v => !v)}>{visible ? 'Hide' : 'Show'}</Button>
      <AnimatePresence>
        {visible && <NewProposalCard onSelectCard={() => setVisible(false)} card={card} />}
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
