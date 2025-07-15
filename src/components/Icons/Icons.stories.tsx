import { Meta, StoryObj } from '@storybook/react'
import * as icons from './'
import type { IconProps } from './types'

const meta: Meta = {
  title: 'Icons/Icons',
  args: {},
  argTypes: {
    size: { control: 'number', description: 'Size of the icon in pixels' },
    fill: { control: 'color', description: 'Fill color of the icon' },
    'aria-label': { control: 'text', description: 'Accessible label for the icon' },
  },
}

export default meta

type Story = StoryObj

const IconsShowcase = (args: IconProps) => (
  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
    {Object.entries(icons)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, Icon]) => (
        <div key={name}>
          <h4>{name}</h4>
          <Icon
            {...{
              ...args,
              strokeWidth: typeof args.strokeWidth === 'string' ? Number(args.strokeWidth) : args.strokeWidth,
            }}
          />
        </div>
      ))}
  </div>
)

export const DefaultIcons: Story = {
  render: args => <IconsShowcase {...args} />,
  args: {},
}

export const CustomSizeAndColor: Story = {
  render: args => <IconsShowcase {...args} />,
  args: {
    size: 48,
    fill: '#FF6347', // Tomato color
    stroke: '#FF6347',
  },
}
