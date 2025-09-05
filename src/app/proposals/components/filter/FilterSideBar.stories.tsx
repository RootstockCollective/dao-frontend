import type { Meta, StoryObj } from '@storybook/nextjs'
import { FilterSideBar } from './FilterSideBar'
import { useState } from 'react'
import { FilterOption } from './filterOptions'

const meta: Meta<typeof FilterSideBar> = {
  title: 'Proposals/FilterSideBar',
  component: FilterSideBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FilterSideBar>

const filterOptions: FilterOption[] = [
  { label: 'Proposals I can vote', value: 'Proposals I can vote' },
  { label: 'Builder proposals', value: 'Builder proposals' },
  { label: 'Treasury proposals', value: 'Treasury proposals' },
  { label: 'Grants', value: 'Grants' },
  { label: 'My proposals', value: 'My proposals' },
]

export const Default: Story = {
  render() {
    const [activeFilters, setActiveFilters] = useState<string[]>([])
    return (
      <div>
        <FilterSideBar
          filterOptions={filterOptions}
          activeFilters={activeFilters}
          onAddFilter={filter => {
            if (filter.value) {
              setActiveFilters(prev => [...prev, filter.value])
            }
          }}
          onRemoveFilter={value => {
            setActiveFilters(prev => prev.filter(v => v !== value))
          }}
        />
      </div>
    )
  },
}
