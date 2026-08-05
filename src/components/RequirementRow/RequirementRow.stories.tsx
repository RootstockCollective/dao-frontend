import type { Meta, StoryObj } from '@storybook/nextjs'

import { RequirementRow } from './RequirementRow'

const meta: Meta<typeof RequirementRow> = {
  title: 'Koto/RequirementRow',
  component: RequirementRow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    Story => (
      <div className="bg-text-80 w-[520px] p-8">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: { position: 1, label: 'RIF in your wallet', isDone: false },
}

export const Done: Story = {
  args: { position: 1, label: 'RIF in your wallet', isDone: true },
}

export const Checklist: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <RequirementRow position={1} label="RIF in your wallet" isDone />
      <RequirementRow position={2} label="rBTC for gas" isDone={false} />
    </div>
  ),
}
