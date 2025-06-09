import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Typography } from '../TypographyNew/Typography'
import { Button } from '../ButtonNew/Button'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    position: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    disabled: { control: 'boolean' },
    text: { control: 'text' },
    className: { control: 'text' },
  },
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    text: 'Default tooltip',
    position: 'right',
    disabled: false,
  },
  render: args => (
    <Tooltip {...args}>
      <button className="px-4 py-2 bg-primary">
        <Typography>Hover me</Typography>
      </button>
    </Tooltip>
  ),
}

export const Disabled: Story = {
  args: {
    text: 'This tooltip will not appear',
    disabled: true,
  },
  render: args => (
    <Tooltip {...args}>
      <button className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed">
        <Typography>Disabled Tooltip</Typography>
      </button>
    </Tooltip>
  ),
}

export const Positions: Story = {
  render: () => (
    <ul className="flex gap-8 flex-wrap">
      {(['top', 'right', 'bottom', 'left'] as const).map(pos => (
        <li key={pos}>
          <Tooltip text={`Position: ${pos}`} position={pos}>
            {/* <span className="px-4 py-2 bg-emerald-600 text-white rounded cursor-pointer">{pos}</span> */}
            <Typography className="px-4 py-2 bg-emerald-600 text-white rounded cursor-pointer">
              {pos}
            </Typography>
          </Tooltip>
        </li>
      ))}
    </ul>
  ),
}
