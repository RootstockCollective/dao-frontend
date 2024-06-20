import type { Meta, StoryObj } from '@storybook/react'
import { Typography } from '@/components/Typography'

const meta = {
  title: 'Components/Typography',
  component: Typography,
  argTypes: {
    tagVariant: {
      control: { type: 'select', options: ['h1', 'h2', 'p', 'span', 'label'] },
    },
    fontWeight: {
      control: { type: 'text' },
    },
    color: {
      control: { type: 'color' },
    },
  },
} satisfies Meta<typeof Typography>

export default meta

type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: {
    tagVariant: 'h1',
    children: 'TREASURY',
  },
}

export const H2: Story = {
  args: {
    tagVariant: 'h2',
    children: 'Heading 2',
    fontWeight: 'normal',
  },
}

export const Paragraph: Story = {
  args: {
    tagVariant: 'p',
    children: 'This is a paragraph.',
    fontWeight: 'bold',
    fontSize: '0.8rem',
  },
}

export const Span: Story = {
  args: {
    tagVariant: 'span',
    children: 'This is a span.',
  },
}

export const Label: Story = {
  args: {
    tagVariant: 'label',
    children: 'This is a label.',
  },
}

export const StrongLabel: Story = {
  args: {
    tagVariant: 'label',
    children: 'This is a strong label.',
    className: 'strong',
  },
}

export const LighterLabel: Story = {
  args: {
    tagVariant: 'label',
    children: 'This is a lighter label.',
    color: 'rgba(113,113,113,1)',
  },
}
