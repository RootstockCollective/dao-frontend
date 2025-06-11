import { Meta, StoryObj } from '@storybook/react'
import { useState, useEffect } from 'react'
import { BottomActionBar } from './BottomActionBar'
import { Button } from '../Button'
import { LayoutProvider, useLayoutContext } from '@/components/MainContainer/LayoutProvider'

const SidebarToggleButtons = () => {
  const { isSidebarOpen, toggleSidebar } = useLayoutContext()
  return (
    <div style={{ marginBottom: 10 }}>
      <Button onClick={toggleSidebar}>{isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}</Button>
    </div>
  )
}

const meta: Meta<typeof BottomActionBar> = {
  title: 'Components/BottomActionBar',
  component: BottomActionBar,
  decorators: [
    Story => (
      <LayoutProvider>
        <div style={{ position: 'relative', minHeight: '400px', padding: '1rem' }}>
          <SidebarToggleButtons />
          <Story />
          <div id="action-bar-portal-target" />
        </div>
      </LayoutProvider>
    ),
  ],
  argTypes: {
    isOpen: { control: 'boolean' },
    className: { control: 'text' },
    portalContainer: { table: { disable: true }, control: false },
  },
  args: {
    isOpen: true,
    className: '',
  },
}
export default meta

type Story = StoryObj<typeof BottomActionBar>

export const Default: Story = {
  render: args => {
    const [container, setContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
      const el = document.getElementById('action-bar-portal-target')
      setContainer(el)
    }, [])

    return (
      <BottomActionBar {...args} portalContainer={container}>
        <div className="flex justify-center gap-2 w-full">
          <Button variant="secondary">Cancel</Button>
          <Button variant="primary">Save</Button>
        </div>
      </BottomActionBar>
    )
  },
}
