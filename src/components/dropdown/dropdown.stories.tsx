import { Meta, StoryObj } from '@storybook/react'
import { Dropdown } from './dropdown'
import { prepareProposalsData } from './data'

const meta = {
  title: 'Components/Dropdown',
  component: Dropdown,
} satisfies Meta<typeof Dropdown>

export default meta

type Story = StoryObj<typeof meta>

export const Default = {
  render: () => (
    <Dropdown
      title={'Test Title'}
      description={'This is a test description to make sure it looks great'}
      itemsData={prepareProposalsData}
    />
  ),
}
