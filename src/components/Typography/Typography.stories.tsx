import type { Meta, StoryObj } from '@storybook/react'
import { Span, Typography } from '@/components/Typography'
import { Paragraph } from '@/components/Typography/Paragraph'
import { Header } from '@/components/Typography/Header'
import { Label } from './Label'

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

type Story = StoryObj<typeof meta>

export const H1: Omit<Story, 'args'> = {
  render: () => <Header variant="h1">TREASURY</Header>,
}

export const H2: Omit<Story, 'args'> = {
  render: () => <Header variant="h2">Heading 2</Header>,
}

export const ParagraphNormal: Omit<Story, 'args'> = {
  render: () => <Paragraph>This is a normal paragraph.</Paragraph>,
}

export const ParagraphLight: Omit<Story, 'args'> = {
  render: () => <Paragraph variant="light">This is a light paragraph.</Paragraph>,
}

export const ParagraphSemibold: Omit<Story, 'args'> = {
  render: () => <Paragraph variant="semibold">This is a semi bold paragraph.</Paragraph>,
}

export const ParagraphError: Omit<Story, 'args'> = {
  render: () => <Paragraph variant="error">This is a text with error</Paragraph>,
}

export const LabelNormal: Omit<Story, 'args'> = {
  render: () => <Label>This is a label</Label>,
}

export const SemiboldLabel: Omit<Story, 'args'> = {
  render: () => <Label variant="semibold">This is a semibold label.</Label>,
}

export const LightLabel: Omit<Story, 'args'> = {
  render: () => <Label variant="light">This is a light label.</Label>,
}

export const SpanDefault: Omit<Story, 'args'> = {
  render: () => <Span>Test</Span>,
}

export const SpanLight: Omit<Story, 'args'> = {
  render: () => <Span variant="light">Light</Span>,
}

export const SpanSmall: Omit<Story, 'args'> = {
  render: () => <Span size="small">Small</Span>,
}
