import { Meta, StoryObj } from '@storybook/react'
import type { IconProps } from '../types'
import * as iconsV3 from './'

const meta: Meta = {
  title: 'Icons/V3 Design Icons',
  args: {},
  argTypes: {
    size: { control: 'number', description: 'Size of the icon in pixels' },
    fill: { control: 'color', description: 'Fill color of the icon' },
    stroke: { control: 'color', description: 'Stroke color of the icon' },
    strokeWidth: { control: 'number', description: 'Stroke width of the icon' },
    'aria-label': { control: 'text', description: 'Accessible label for the icon' },
  },
}

export default meta

type Story = StoryObj

interface ExtendedIconProps extends IconProps {
  stroke?: string
  strokeWidth?: number
}

const IconsV3Showcase = (args: ExtendedIconProps) => (
  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
    {Object.entries(iconsV3)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, Icon]) => (
        <div
          key={name}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <h4 style={{ margin: 0, fontSize: '14px', textAlign: 'center' }}>{name}</h4>
          <div style={{ padding: '8px', border: '1px solid #eee', borderRadius: '4px' }}>
            <Icon
              {...{
                ...args,
                strokeWidth:
                  typeof args.strokeWidth === 'string' ? Number(args.strokeWidth) : args.strokeWidth,
              }}
            />
          </div>
        </div>
      ))}
  </div>
)

export const DefaultV3Icons: Story = {
  render: args => <IconsV3Showcase {...args} />,
  args: {},
}

export const CustomSizeAndColors: Story = {
  render: args => <IconsV3Showcase {...args} />,
  args: {
    size: 32,
    fill: '#FF6347', // Tomato color
    stroke: '#4169E1', // Royal blue
    strokeWidth: 2,
  },
}

export const LargeIcons: Story = {
  render: args => <IconsV3Showcase {...args} />,
  args: {
    size: 48,
    fill: '#32CD32', // Lime green
    stroke: '#FF1493', // Deep pink
    strokeWidth: 1.5,
  },
}

export const MonochromeIcons: Story = {
  render: args => <IconsV3Showcase {...args} />,
  args: {
    size: 24,
    fill: '#333333',
    stroke: '#333333',
    strokeWidth: 1,
  },
}

// Individual icon stories for easy access
export const CogIcon: Story = {
  render: args => <iconsV3.CogIcon {...args} />,
  args: {
    size: 24,
  },
}

export const HandshakeIcon: Story = {
  render: args => <iconsV3.HandshakeIcon {...args} />,
  args: {
    size: 24,
  },
}

export const ChartIcon: Story = {
  render: args => <iconsV3.ChartIcon {...args} />,
  args: {
    size: 24,
  },
}

export const ArrowDownWFillIcon: Story = {
  render: args => <iconsV3.ArrowDownWFill {...args} />,
  args: {
    size: 24,
  },
}

export const ArrowsUpDownIcon: Story = {
  render: args => <iconsV3.ArrowsUpDown {...args} />,
  args: {
    size: 24,
  },
}

export const ArrowUpWFillIcon: Story = {
  render: args => <iconsV3.ArrowUpWFill {...args} />,
  args: {
    size: 24,
  },
}
