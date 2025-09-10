import type { Meta, StoryObj } from '@storybook/nextjs'
import { FilterSideBar } from './FilterSideBar'
import { useState } from 'react'
import { FilterItem, FilterType } from './types'

const meta: Meta<typeof FilterSideBar> = {
  title: 'Proposals/FilterSideBar',
  component: FilterSideBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FilterSideBar>

const createFilterItem = (label: string): FilterItem => ({
  id: `filter-${label}`,
  type: FilterType.CATEGORY,
  label,
  value: label,
  validate: () => true,
})

const filterOptions: Record<string, FilterItem[]> = {
  [FilterType.CATEGORY]: [
    createFilterItem('Proposals I can vote'),
    createFilterItem('Builder proposals'),
    createFilterItem('Treasury proposals'),
    createFilterItem('Grants'),
    createFilterItem('My proposals'),
  ],
  [FilterType.STATUS]: [
    createFilterItem('Pending'),
    createFilterItem('Active'),
    createFilterItem('Executed'),
    createFilterItem('Defeated'),
  ],
  [FilterType.TIME]: [
    createFilterItem('Last week'),
    createFilterItem('Last month'),
    createFilterItem('Last 90 days'),
  ],
}

export const Default: Story = {
  render() {
    const [activeFilters, setActiveFilters] = useState<FilterItem[]>([])
    return (
      <div>
        <FilterSideBar
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onAddFilter={filter => {
            setActiveFilters(prev => [...prev, filter])
          }}
          onRemoveFilter={id => {
            setActiveFilters(prev => prev.filter(v => v.id !== id))
          }}
        />
      </div>
    )
  },
}
