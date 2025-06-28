import type { Meta, StoryObj } from '@storybook/react'
import { FilterSideBar } from './FilterSideBar'
import { useState } from 'react'

const meta: Meta<typeof FilterSideBar> = {
  title: 'Proposals/FilterSideBar',
  component: FilterSideBar,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FilterSideBar>

const filterOptions = [
  'Proposals I can vote',
  'Builder proposals',
  'Treasury proposals',
  'Grants',
  'My proposals',
]

export const Default: Story = {
  render() {
    const [currentFilter, setCurrentFilter] = useState(filterOptions[0])
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
