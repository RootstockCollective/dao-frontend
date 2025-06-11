import { Meta, StoryObj } from '@storybook/react'
import { useEffect, useState } from 'react'
import { BottomDrawer } from './BottomDrawer'

const meta: Meta<typeof BottomDrawer> = {
  title: 'Components/BottomDrawer',
  component: BottomDrawer,
  decorators: [
    Story => (
      <div style={{ position: 'relative', minHeight: '400px', padding: '1rem' }}>
        <Story />
        <div id="drawer-portal-target" />
      </div>
    ),
  ],
  argTypes: {
    isOpen: { control: 'boolean' },
    leftOffset: { control: { type: 'number', min: 0, step: 10 } },
    portalContainer: { table: { disable: true }, control: false },
  },
  args: {
    isOpen: false,
    leftOffset: 0,
  },
}
export default meta

type Story = StoryObj<typeof BottomDrawer>

export const Default: Story = {
  render: args => {
    const [container, setContainer] = useState<HTMLElement | null>(null)

    useEffect(() => {
      const el = document.getElementById('drawer-portal-target')
      setContainer(el)
    }, [])

    return (
      <>
        <BottomDrawer {...args} portalContainer={container}>
          <div className="bg-white shadow-md p-4">
            <div className="text-center text-black">This is the drawer content.</div>
          </div>
        </BottomDrawer>
      </>
    )
  },
}
