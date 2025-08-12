import type { Meta, StoryObj } from '@storybook/nextjs'
import { ErrorMessageAlert } from './ErrorMessageAlert'

const meta: Meta<typeof ErrorMessageAlert> = {
  title: 'Components/ErrorMessageAlert',
  component: ErrorMessageAlert,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ErrorMessageAlert>

export const Default: Story = {
  args: {
    title: 'Sorry!',
    message: 'An error occurred. Please try again shortly.',
  },
}

export const CustomMessage: Story = {
  args: {
    title: 'Error Loading Data',
    message: 'Unable to fetch the requested data. Please check your connection and try again.',
  },
}
