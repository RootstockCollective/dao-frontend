import type { Meta, StoryObj } from '@storybook/react'
import HealthCheck from '@/app/health/page'

const meta = {
  title: 'Health/Main',
  component: HealthCheck,
} satisfies Meta<typeof HealthCheck>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
