import type { Meta, StoryObj } from '@storybook/react'
import BuildersTable from './BuildersTable'

const meta: Meta<typeof BuildersTable> = {
  title: 'Builders/BuildersTable',
  component: BuildersTable,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'The default builders table showing mock data with pagination and column management.',
      },
    },
  },
  render: () => (
    <div className="w-full bg-v3-bg-accent-80">
      <BuildersTable />
    </div>
  ),
}

export const WithMockData: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Builders table with mock data for testing purposes. This story demonstrates the table functionality without requiring actual API data.',
      },
    },
  },
}
