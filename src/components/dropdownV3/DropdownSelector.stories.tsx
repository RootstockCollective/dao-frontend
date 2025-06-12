import { useState } from 'react'
import { DropdownSelector, SelectorOption } from './DropdownSelector'

export default {
  title: 'DropdownV3/DropdownSelector',
  component: DropdownSelector,
}

const options: SelectorOption[] = [
  { id: 'builder', label: 'Builder' },
  { id: 'backing', label: 'Backing' },
  { id: 'rewardsPercent', label: 'Rewards %' },
  { id: 'change', label: 'Change' },
  { id: 'rewardsPast', label: 'Rewards', sublabel: 'past cycle' },
  { id: 'rewardsUpcoming', label: 'Rewards', sublabel: 'upcoming cycle' },
  { id: 'allocations', label: 'Allocations' },
]

export const Basic = () => {
  const [selected, setSelected] = useState<string[]>([])
  return (
    <DropdownSelector
      title="Select Columns"
      options={options}
      selected={selected}
      onChange={ids => setSelected(ids)}
    />
  )
}
