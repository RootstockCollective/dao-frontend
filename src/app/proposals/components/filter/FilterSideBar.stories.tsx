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

export const Default: Story = {
  render() {
    const [isOpen, setIsOpen] = useState(true)
    const [activeFilters, setActiveFilters] = useState<FilterItem[]>([])

    return (
      <div className="h-screen bg-bg-80">
        <FilterSideBar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          activeFilters={activeFilters}
          onAddFilter={filter => {
            setActiveFilters(prev => [...prev, filter])
          }}
          onRemoveFilter={id => {
            setActiveFilters(prev => prev.filter(f => f.id !== id))
          }}
        />
      </div>
    )
  },
}
