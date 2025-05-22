import { Button } from '@/components/Button'
import type { Meta, StoryObj } from '@storybook/react'
import { ActionsContainer } from './ActionsContainer'

const meta = {
  title: 'Koto/Container/ActionsContainer',
  component: ActionsContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof ActionsContainer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataTestid: 'test',
    children: (
      <>
        <Button>Action 1</Button>
        <Button>Action 2</Button>
      </>
    ),
  },
}

export const WithCustomClassName: Story = {
  args: {
    dataTestid: 'test',
    className: 'bg-gray-100',
    children: (
      <>
        <Button>Action 1</Button>
        <Button>Action 2</Button>
      </>
    ),
  },
}
