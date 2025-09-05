import type { Meta, StoryObj } from '@storybook/nextjs'
import { FilterSideBar } from './FilterSideBar'
import { useState } from 'react'

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
    const [activeFilters, setActiveFilters] = useState<string[]>([])

    return (
      <div className="h-screen bg-bg-80">
        <FilterSideBar
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
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
