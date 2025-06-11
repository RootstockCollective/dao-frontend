import React, { useState } from 'react'
import { DropdownSelector, SelectorOption } from './DropdownSelector'

export default {
  title: 'DropdownV3/DropdownSelector',
  component: DropdownSelector,
}

const options: SelectorOption[] = [
  { label: 'Builder', value: 'builder' },
  { label: 'Backing', value: 'backing' },
  { label: 'Rewards %', value: 'rewardsPercent' },
  { label: 'Change', value: 'change' },
  { label: 'Rewards', value: 'rewardsPast', sublabel: 'past cycle' },
  { label: 'Rewards', value: 'rewardsUpcoming', sublabel: 'upcoming cycle' },
  { label: 'Allocations', value: 'allocations' },
]

export const Basic = () => {
  const [selected, setSelected] = useState<number[]>([])
  return (
    <DropdownSelector
      title="Select Columns"
      options={options}
      selected={selected}
      onChange={(_, indices) => setSelected(indices)}
    />
  )
}
