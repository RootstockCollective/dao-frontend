import type { Meta, StoryObj } from '@storybook/react'
import { Typography, Label } from '@/components/Typography'
import { Paragraph } from '@/components/Typography/Paragraph'
import { Header } from '@/components/Typography/Header'

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

export const H1: Omit<Story, 'args'> = {
  render: () => (
    <Header variant='h1'>TREASURY</Header>
  ),
}

export const H2: Omit<Story, 'args'> = {
  render: () => (
    <Header variant='h2'>Heading 2</Header>
  ),
}

export const ParagraphNormal: Omit<Story, 'args'> = {
  render: () => (
    <Paragraph>This is a normal paragraph.</Paragraph>
  ),
}

export const ParagraphLight: Omit<Story, 'args'> = {
  render: () => (
    <Paragraph variant='light'>This is a light paragraph.</Paragraph>
  ),
}

export const Span: Story = {
  args: {
    tagVariant: 'span',
    children: 'This is a span.',
  },
}

export const LabelNormal: Omit<Story, 'args'> = {
  render: () => (
    <Label>This is a label</Label>
  ),
}

export const StrongLabel: Omit<Story, 'args'> = {
  render: () => (
    <Label variant='strong'>This is a strong label.</Label>
  ),
}

export const LighterLabel: Omit<Story, 'args'> = {
  render: () => (
    <Label variant='light'>This is a lighter label.</Label>
  ),
}
