import { Meta, StoryObj } from '@storybook/react'
import { MoreIcon } from './MoreIcon'

const meta: Meta<typeof MoreIcon> = {
  title: 'Icons/MoreIcon',
  component: MoreIcon,
  argTypes: {
    size: { control: 'number', description: 'Size of the icon in pixels' },
    fill: { control: 'color', description: 'Fill color of the icon' },
    'aria-label': { control: 'text', description: 'Accessible label for the icon' },
  },
}

export default meta
type Story = StoryObj<typeof MoreIcon>

export const Default: Story = {
  args: {},
}

export const SizeComparison: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div>
        <p>Small (16px)</p>
        <MoreIcon {...args} size={16} />
      </div>
      <div>
        <p>Default (24px)</p>
        <MoreIcon {...args} size={24} />
      </div>
      <div>
        <p>Medium (32px)</p>
        <MoreIcon {...args} size={32} />
      </div>
      <div>
        <p>Large (48px)</p>
        <MoreIcon {...args} size={48} />
      </div>
    </div>
  ),
}

export const ColorVariants: Story = {
  render: args => (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      <div>
        <p>Default</p>
        <MoreIcon {...args} />
      </div>
      <div>
        <p>Primary</p>
        <MoreIcon {...args} fill="#007AFF" />
      </div>
      <div>
        <p>Success</p>
        <MoreIcon {...args} fill="#28A745" />
      </div>
      <div>
        <p>Warning</p>
        <MoreIcon {...args} fill="#FFC107" />
      </div>
      <div>
        <p>Danger</p>
        <MoreIcon {...args} fill="#DC3545" />
      </div>
    </div>
  ),
}

export const CustomSizeAndColor: Story = {
  args: {
    size: 40,
    fill: '#FF6347',
  },
}
