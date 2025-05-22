import { Button } from '@/components/Button'
import type { Meta, StoryObj } from '@storybook/react'
import { PageTitleContainer } from './PageTitleContainer'

const meta = {
  title: 'Koto/Container/PageTitleContainer',
  component: PageTitleContainer,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof PageTitleContainer>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    dataTestid: 'test',
    left: 'Page Title',
  },
}

export const WithRightText: Story = {
  args: {
    dataTestid: 'test',
    left: 'Page Title',
    right: 'Right Text',
  },
}

export const WithRightComponent: Story = {
  args: {
    dataTestid: 'test',
    left: 'Page Title',
    right: <Button>Action Button</Button>,
  },
}

export const WithCustomClassName: Story = {
  args: {
    dataTestid: 'test',
    left: 'Page Title',
    right: 'Right Text',
    className: 'bg-gray-100 p-4',
  },
}
