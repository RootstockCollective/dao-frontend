import { Circle } from '@/components/Circle'
import { HourglassIcon } from '@/components/Icons/HourglassIcon'
import type { Meta, StoryObj } from '@storybook/nextjs'
import {
  BarTooltip,
  BarTooltipConent,
  BarTooltipLabelItem,
  BarTooltipLabels,
  BarTooltipValueItem,
  BarTooltipValues,
} from './BarTooltipConent'

const meta = {
  title: 'KOTO/Backing/Components/BarTooltip',
  component: BarTooltip,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof BarTooltip>

export default meta

type Story = StoryObj<typeof meta>

const builders = ['0xBuilder1', '0xBuilder2']
const builderColors = ['#FF5733', '#33C1FF']
const pending = [3000000000n, 50000000n]
const onchain = [20000n, 10000000000n]

export const Default: Story = {
  args: {
    className: '',
  },
  parameters: {
    controls: { exclude: ['children'] },
  },
  render: args => (
    <BarTooltip {...args}>
      <BarTooltipConent className="">
        <BarTooltipLabels>
          {builders.map((builder, index) => (
            <BarTooltipLabelItem key={`${index}: ${builder}`}>
              <Circle color={builderColors[index]} className="w-2 h-2" /> {builder}
            </BarTooltipLabelItem>
          ))}
        </BarTooltipLabels>

        <BarTooltipValues label="Pending">
          {pending.map((value, index) => (
            <BarTooltipValueItem key={`${index}: ${value.toString()}`}>
              <HourglassIcon className="size-4" color="var(--background-40)" />
              {value.toString()}
            </BarTooltipValueItem>
          ))}
        </BarTooltipValues>

        <BarTooltipValues label="Current">
          {onchain.map((value, index) => (
            <BarTooltipValueItem key={`${index}: ${value.toString()}`}>
              {value.toString()}
            </BarTooltipValueItem>
          ))}
        </BarTooltipValues>
      </BarTooltipConent>
    </BarTooltip>
  ),
}
