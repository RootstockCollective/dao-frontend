import type { Meta, StoryObj } from '@storybook/react'
import { PageTitleContainer } from './PageTitleContainer'

const meta = {
  title: 'Koto/Backing/Container/PageTitleContainer',
  component: PageTitleContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PageTitleContainer>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    leftText: 'Custom Styled',
  },
}

export const WithCustomClassName: Story = {
  args: {
    leftText: 'Custom Styled',
    className: 'bg-green-500 rounded-lg shadow-md',
  },
}
