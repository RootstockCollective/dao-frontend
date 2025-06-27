import type { Meta, StoryObj } from '@storybook/react'
import { IntroModalContent } from './IntroModalContent'
import { CONTENT_CONFIG } from './config'

const meta: Meta<typeof IntroModalContent> = {
  title: 'User/IntroModal/IntroModalContent',
  component: IntroModalContent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tokenStatus: {
      control: 'select',
      options: Object.keys(CONTENT_CONFIG),
    },
    isDesktop: {
      control: 'boolean',
    },
    rbtcBalance: {
      control: 'text',
    },
    rifBalance: {
      control: 'text',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const NeedBothRBTCAndRIFDesktop: Story = {
  args: {
    tokenStatus: 'NEED_RBTC_RIF',
    isDesktop: true,
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedBothRBTCAndRIFMobile: Story = {
  args: {
    tokenStatus: 'NEED_RBTC_RIF',
    isDesktop: false,
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedRBTCDesktop: Story = {
  args: {
    tokenStatus: 'NEED_RBTC',
    isDesktop: true,
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedRBTCMobile: Story = {
  args: {
    tokenStatus: 'NEED_RBTC',
    isDesktop: false,
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedRIFDesktop: Story = {
  args: {
    tokenStatus: 'NEED_RIF',
    isDesktop: true,
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedRIFMobile: Story = {
  args: {
    tokenStatus: 'NEED_RIF',
    isDesktop: false,
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedSTRIFDesktop: Story = {
  args: {
    tokenStatus: 'NEED_STRIF',
    isDesktop: true,
    rbtcBalance: '0.1234',
    rifBalance: '543.21',
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedSTRIFMobile: Story = {
  args: {
    tokenStatus: 'NEED_STRIF',
    isDesktop: false,
    rbtcBalance: '0.1234',
    rifBalance: '543.21',
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}
