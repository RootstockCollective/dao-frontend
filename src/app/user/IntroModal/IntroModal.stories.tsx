import type { Meta, StoryObj } from '@storybook/nextjs'
import { IntroModalContent } from './IntroModalContent'
import { CONTENT_CONFIG } from './config'

const meta: Meta<typeof IntroModalContent> = {
  title: 'Koto/DAO/IntroModal',
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

export const NeedBothRBTCAndRIF: Story = {
  args: {
    tokenStatus: 'NEED_RBTC_RIF',
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedRBTC: Story = {
  args: {
    tokenStatus: 'NEED_RBTC',
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedRIF: Story = {
  args: {
    tokenStatus: 'NEED_RIF',
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}

export const NeedSTRIF: Story = {
  args: {
    tokenStatus: 'NEED_STRIF',
    rbtcBalance: '0.1234',
    rifBalance: '543.21',
    onClose: () => console.log('Modal closed'),
    onContinue: () => console.log('Continue'),
  },
}
