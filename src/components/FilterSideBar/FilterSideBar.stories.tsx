import type { Meta, StoryObj } from '@storybook/nextjs'
import { FilterSideBar } from './FilterSideBar'
import { useState } from 'react'
import { FilterGroup, ActiveFilter } from './types'
import { TokenImage } from '@/components/TokenImage'

const meta: Meta<typeof FilterSideBar> = {
  title: 'Components/FilterSideBar',
  component: FilterSideBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FilterSideBar>

export const ProposalsFilters: Story = {
  render() {
    const [isOpen, setIsOpen] = useState(true)
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

    const proposalsFilterGroups: FilterGroup[] = [
      {
        id: 'category',
        title: 'FILTER BY CATEGORY',
        allLabel: 'All categories',
        allTestId: 'AllCategories',
        isMultiSelect: true,
        options: [
          { label: 'Grants', value: 'Grants' },
          { label: 'Builder', value: 'Builder' },
          { label: 'Grant - all milestones', value: 'milestone-all' },
          { label: 'Grants - milestone 1', value: 'milestone-1' },
        ],
      },
      {
        id: 'status',
        title: 'FILTER BY STATUS',
        allLabel: 'All statuses',
        allTestId: 'AllStatuses',
        isMultiSelect: true,
        options: [
          { label: 'Pending', value: 'Pending' },
          { label: 'Active', value: 'Active' },
          { label: 'Executed', value: 'Executed' },
          { label: 'Defeated', value: 'Defeated' },
        ],
      },
      {
        id: 'time',
        title: 'FILTER BY TIME',
        allLabel: 'All proposals',
        allTestId: 'AllProposals',
        isMultiSelect: false,
        options: [
          { label: 'Last week', value: 'last-week' },
          { label: 'Last month', value: 'last-month' },
          { label: 'Last 90 days', value: 'last-90-days' },
          { label: 'Wave 4', value: 'Wave 4' },
          { label: 'Wave 5', value: 'Wave 5' },
        ],
      },
    ]

    const handleApply = (filters: ActiveFilter[]) => {
      setActiveFilters(filters)
    }

    return (
      <div className="h-screen bg-bg-80">
        <FilterSideBar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          filterGroups={proposalsFilterGroups}
          activeFilters={activeFilters}
          onApply={handleApply}
        />
      </div>
    )
  },
}

export const TransactionHistoryFilters: Story = {
  render() {
    const [isOpen, setIsOpen] = useState(true)
    const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([])

    // Simulate dynamic builders loaded from an API
    const [builders] = useState([
      { label: 'Peppery', value: 'peppery' },
      { label: '0x1D11...2D00', value: '0x1D11...2D00' },
      { label: '0x2B7A...4F88', value: '0x2B7A...4F88' },
      { label: '0x2B7A...4F99', value: '0x2B7A...4F99' },
    ])

    const filterGroups: FilterGroup[] = [
      {
        id: 'type',
        title: 'FILTER BY TYPE',
        allLabel: 'All types',
        allTestId: 'AllTypes',
        isMultiSelect: true,
        options: [
          { label: 'Claim', value: 'claim' },
          { label: 'Back', value: 'back' },
        ],
      },
      {
        id: 'claim-token',
        title: 'FILTER BY CLAIM TOKEN',
        allLabel: 'All claim tokens',
        allTestId: 'AllClaimTokens',
        isMultiSelect: true,
        options: [
          { label: 'RIF', value: 'rif', icon: <TokenImage symbol="RIF" size={16} /> },
          { label: 'USDRIF', value: 'usdrif', icon: <TokenImage symbol="USDRIF" size={16} /> },
          { label: 'rBTC', value: 'rbtc', icon: <TokenImage symbol="RBTC" size={16} /> },
        ],
      },
      {
        id: 'builder',
        title: 'FILTER BY BUILDER',
        allLabel: 'All builders',
        allTestId: 'AllBuilders',
        isMultiSelect: true,
        options: builders,
      },
    ]

    const handleApply = (filters: ActiveFilter[]) => {
      setActiveFilters(filters)
    }

    return (
      <div className="h-screen bg-bg-80 flex gap-4">
        <FilterSideBar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          filterGroups={filterGroups}
          activeFilters={activeFilters}
          onApply={handleApply}
        />
        <div className="flex-1 p-8 text-white">
          <h2 className="text-xl font-bold mb-4">Active Filters:</h2>
          {activeFilters.length === 0 ? (
            <p className="text-text-60">No filters selected. Click filters to see them here.</p>
          ) : (
            <ul className="space-y-2">
              {activeFilters.map((f, i) => (
                <li key={i} className="bg-bg-60 p-3 rounded">
                  <span className="text-text-40 text-sm uppercase">{f.groupId}</span>
                  <br />
                  <span className="text-white">{f.option.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    )
  },
}
