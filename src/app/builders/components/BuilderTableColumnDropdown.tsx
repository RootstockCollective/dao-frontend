import { useState } from 'react'
import { Dropdown } from '@/components/dropdownV3/Dropdown'
import { DropdownSelector, SelectorOption } from '@/components/dropdownV3/DropdownSelector'
import { DropdownTrigger } from '@/components/dropdownV3/DropdownTrigger'

const columnOptions: SelectorOption[] = [
  { label: 'Builder', value: 'builder' },
  { label: 'Backing', value: 'backing' },
  { label: 'Rewards %', value: 'rewardsPercent' },
  { label: 'Change', value: 'change' },
  { label: 'Rewards', value: 'rewardsPast', sublabel: 'past cycle' },
  { label: 'Rewards', value: 'rewardsUpcoming', sublabel: 'upcoming cycle' },
  { label: 'Allocations', value: 'allocations' },
]

export interface BuilderTableColumnDropdownProps {
  className?: string
}

export const BuilderTableColumnDropdown: React.FC<BuilderTableColumnDropdownProps> = ({ className }) => {
  // FIXME: interact with the table context once ready
  const [selected, setSelected] = useState<number[]>([])

  return (
    <div className={className}>
      <Dropdown
        direction="bottom-left"
        trigger={
          <DropdownTrigger className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#39342A] transition-colors" />
        }
      >
        <DropdownSelector
          title="Table Columns"
          options={columnOptions}
          selected={selected}
          onChange={(_, indices) => setSelected(indices)}
        />
      </Dropdown>
    </div>
  )
}
