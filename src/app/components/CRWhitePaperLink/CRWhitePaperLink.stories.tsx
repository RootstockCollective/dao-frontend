import { CRWhitepaperLink } from './CRWhitePaperLink'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof CRWhitepaperLink> = {
  title: 'Collective Rewards/CRWhitepaperLink',
  component: CRWhitepaperLink,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes to apply to the link',
    },
    style: {
      control: { type: 'object' },
      description: 'Inline styles to apply to the link',
    },
    children: {
      control: { type: 'text' },
      description: 'The text content to display in the link',
    },
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof CRWhitepaperLink>

export const Default: Story = {
  args: {
    children: 'Read the Collective Rewards Whitepaper',
  },
}

export const CustomText: Story = {
  args: {
    children: 'View Whitepaper',
  },
}

export const WithCustomStyling: Story = {
  args: {
    children: 'Download Whitepaper PDF',
    className: 'text-blue-600 font-semibold',
  },
}

export const WithInlineStyles: Story = {
  args: {
    children: '📄 Collective Rewards Documentation',
    style: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2563eb',
    },
  },
}

export const LongText: Story = {
  args: {
    children:
      'Access the comprehensive Collective Rewards whitepaper to understand the tokenomics and reward distribution mechanisms',
  },
}

export const ShortText: Story = {
  args: {
    children: 'Whitepaper',
  },
}

export const WithIcon: Story = {
  args: {
    children: '📋 Whitepaper',
  },
}

export const CustomVariant: Story = {
  args: {
    children: 'Read Whitepaper',
    className: 'text-green-600 hover:text-green-800 underline',
  },
}
