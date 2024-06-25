import type { Meta, StoryObj } from '@storybook/react'
import { LeftSidebar } from '@/components/LeftSidebar/LeftSidebar'
import { MouseEvent, useState } from 'react'
import { SidebarButtonsProps } from '@/components/LeftSidebar/types'
import { within, userEvent } from '@storybook/test'

const meta = {
  component: LeftSidebar,
  title: 'Components/LeftSidebar'
} satisfies Meta<typeof LeftSidebar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  
}

export const TreasuryActive: Story = {
  args: {
    activeButton: 'treasury'
  }
}

export const Tested: Story = {
  render: () => {
    const [activeButton, setActiveButton] = useState<SidebarButtonsProps['activeButton']>('communities')
    
    const onButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
      setActiveButton(e.currentTarget.name as SidebarButtonsProps['activeButton'])
    }
    return <LeftSidebar activeButton={activeButton} onSidebarButtonClick={onButtonClick} />
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    
    const treasury = canvas.getByText('Treasury')
    
    await userEvent.click(treasury)
    
    const user = canvas.getByText('User')
    
    await userEvent.click(user)
  }
}
