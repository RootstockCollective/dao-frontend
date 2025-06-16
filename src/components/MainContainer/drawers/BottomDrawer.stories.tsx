import { Meta, StoryObj } from '@storybook/react'
import { BottomDrawer } from './BottomDrawer'
import { LayoutProvider, useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { Button } from '@/components/ButtonNew/Button'
import { ActionsContainer } from '@/components/containers/ActionsContainer'

const Controls = () => {
  const { isSidebarOpen, toggleSidebar, isDrawerOpen, openDrawer, closeDrawer } = useLayoutContext()

  const handleToggleDrawer = () => {
    if (isDrawerOpen) {
      closeDrawer()
    } else {
      openDrawer(
        <ActionsContainer className="gap-0">
          <div className="flex justify-center gap-2 w-full">
            <Button variant="secondary" onClick={closeDrawer}>
              Cancel
            </Button>
            <Button variant="primary">Save new backing amounts</Button>
          </div>
        </ActionsContainer>,
      )
    }
  }

  return (
    <div style={{ marginBottom: 10, display: 'flex', gap: '10px' }}>
      <Button onClick={toggleSidebar}>{isSidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}</Button>
      <Button onClick={handleToggleDrawer}>{isDrawerOpen ? 'Close Drawer' : 'Open Drawer'}</Button>
    </div>
  )
}

const meta: Meta<typeof BottomDrawer> = {
  title: 'Components/BottomDrawer',
  component: BottomDrawer,
  decorators: [
    Story => (
      <LayoutProvider>
        <div style={{ position: 'relative', minHeight: '400px', padding: '1rem' }}>
          <div style={{ position: 'fixed', top: '10px', left: '10px', zIndex: 1000 }}>
            <Controls />
          </div>
          <div id="main-container" style={{ paddingTop: '60px' }} />
          <Story />
        </div>
      </LayoutProvider>
    ),
  ],
  argTypes: {
    className: { control: 'text' },
  },
  args: {
    className: '',
  },
}
export default meta

type Story = StoryObj<typeof BottomDrawer>

export const Default: Story = {
  render: args => <BottomDrawer {...args} />,
}
