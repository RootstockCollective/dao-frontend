import type { Meta, StoryObj } from '@storybook/react'
import { LatestProposalsTableMemoized as LatestProposalsTable } from './LatestProposalsTable'
import { mockProposalListData } from './mockProposalData'

const meta: Meta<typeof LatestProposalsTable> = {
  title: 'Proposals/LatestProposalsTable',
  component: LatestProposalsTable,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/proposals',
        query: {
          page: '1',
        },
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof LatestProposalsTable>

export const Default: Story = {
  args: {
    proposals: mockProposalListData,
  },
}

export const Empty: Story = {
  args: {
    proposals: [],
  },
}
