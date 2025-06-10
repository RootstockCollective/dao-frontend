import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../ButtonNew/Button'
import { Typography } from '../TypographyNew/Typography'

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  argTypes: {
    side: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left'],
    },
    disabled: { control: 'boolean' },
    text: { control: 'text' },
    className: { control: 'text' },
    sideOffset: {
      control: 'number',
      description: 'Tooltip offset relative to the trigger',
      defaultValue: 5,
    },
  },
}

export default meta

type Story = StoryObj<typeof Tooltip>

export const Default: Story = {
  args: {
    text: 'Default tooltip',
    side: 'right',
    disabled: false,
  },
  render: args => (
    <Tooltip {...args}>
      <Button>Hover me</Button>
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
      <Button disabled={args.disabled}>Disabled Tooltip</Button>
    </Tooltip>
  ),
}

export const Positions: Story = {
  render: () => (
    <ul className="flex gap-8 flex-wrap">
      {(['top', 'right', 'bottom', 'left'] as const).map(side => (
        <li key={side}>
          <Tooltip text={`Position: ${side}`} side={side}>
            <Button className="bg-emerald-600 text-white">{side}</Button>
          </Tooltip>
        </li>
      ))}
    </ul>
  ),
}

export const WithSideOffset: Story = {
  args: {
    text: 'Tooltip with custom sideOffset',
    side: 'right',
    sideOffset: 30,
  },
  render: args => (
    <div className="flex flex-col items-start gap-2">
      <Tooltip {...args}>
        <Button className="bg-indigo-600 text-white">Hover me</Button>
      </Tooltip>
      <span className="text-xs text-gray-500">sideOffset: {args.sideOffset}</span>
    </div>
  ),
}

export const TooltipOnTypography: Story = {
  args: {
    text: 'Tip on Typography',
    side: 'top',
  },
  render: args => (
    <Tooltip {...args}>
      <Typography as="p" className="w-fit text-lg text-emerald-700 bg-green-200" bold>
        Hover me
      </Typography>
    </Tooltip>
  ),
}
