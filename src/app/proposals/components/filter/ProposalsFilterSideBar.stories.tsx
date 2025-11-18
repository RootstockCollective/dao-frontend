import type { Meta, StoryObj } from '@storybook/nextjs'
import { ProposalsFilterSideBar } from './ProposalsFilterSideBar'
import { useState } from 'react'
import { FilterItem } from './types'

const meta: Meta<typeof ProposalsFilterSideBar> = {
  title: 'Proposals/ProposalsFilterSideBar',
  component: ProposalsFilterSideBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof ProposalsFilterSideBar>

export const Default: Story = {
  render() {
    const [isOpen, setIsOpen] = useState(true)
    const [activeFilters, setActiveFilters] = useState<FilterItem[]>([])

    return (
      <div className="h-screen bg-bg-80">
        <ProposalsFilterSideBar
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
