import { Dropdown } from './Dropdown'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Dropdown> = {
  title: 'DropdownV3/Dropdown',
  component: Dropdown,
}

export default meta
type Story = StoryObj<typeof Dropdown>

export const Basic: Story = {
  render: () => (
    <Dropdown trigger={<button>Open Dropdown</button>}>
      <div style={{ padding: 16 }}>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </div>
    </Dropdown>
  ),
}

export const WithRenderProp: Story = {
  render: () => (
    <Dropdown trigger={<button>Open Dropdown</button>}>
      {close => (
        <div style={{ padding: 16 }}>
          <div onClick={close}>Close me (Item 1)</div>
          <div>Item 2</div>
        </div>
      )}
    </Dropdown>
  ),
}
