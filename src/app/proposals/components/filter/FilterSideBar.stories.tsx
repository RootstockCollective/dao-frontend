import type { Meta, StoryObj } from '@storybook/react'
import { FilterSideBar, type FilterOption } from './FilterSideBar'
import { useState } from 'react'

const meta: Meta<typeof FilterSideBar> = {
  title: 'Proposals/FilterSideBar',
  component: FilterSideBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FilterSideBar>

const filterOptions: FilterOption[] = [
  { id: 0, name: 'All categories' },
  { id: 1, name: 'Proposals I can vote' },
  { id: 2, name: 'Builder proposals' },
  { id: 3, name: 'Treasury proposals' },
  { id: 4, name: 'Grants' },
  { id: 5, name: 'My proposals' },
]

export const Default: Story = {
  render() {
    const [currentFilter, setCurrentFilter] = useState<number>(0)
    return (
      <div>
        <FilterSideBar
          filterOptions={filterOptions}
          currentFilter={currentFilter}
          setCurrentFilter={setCurrentFilter}
        />
      </div>
    )
  },
}
