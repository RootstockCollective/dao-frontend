import { Meta, StoryObj } from '@storybook/react'
import { Dropdown } from './dropdown'

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
} satisfies Meta<typeof Dropdown>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <Dropdown />,
}
