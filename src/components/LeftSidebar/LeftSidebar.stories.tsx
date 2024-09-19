import { LeftSidebar } from '@/components/LeftSidebar/LeftSidebar'
import { SidebarButtonType } from '@/components/LeftSidebar/types'
import type { Meta, StoryObj } from '@storybook/react'
import { userEvent, within } from '@storybook/test'
import { useState } from 'react'

const meta = {
  component: LeftSidebar,
  title: 'Components/LeftSidebar',
} satisfies Meta<typeof LeftSidebar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TreasuryActive: Story = {
  args: {
    activeButton: 'treasury',
  },
}

export const Tested: Story = {
  render: () => {
    const [activeButton, setActiveButton] = useState<SidebarButtonType>('communities')

    const onButtonClick = (activeButton: SidebarButtonType) => setActiveButton(activeButton)
    return <LeftSidebar activeButton={activeButton} onSidebarButtonClick={onButtonClick} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const treasury = canvas.getByText('Treasury')

    await userEvent.click(treasury)

    const user = canvas.getByText('User')

    await userEvent.click(user)
  },
}
