import { FC, useState } from 'react'
import { DropdownSelector, SelectorOption } from '@/components/dropdownV3/DropdownSelector'
import { CommonComponentProps } from '@/components/commonProps'
import { Button } from '@/components/Button'
import { MoreIcon } from '@/components/Icons/MoreIcon'

const columnOptions: SelectorOption[] = [
  { id: 'builder', label: 'Builder' },
  { id: 'backing', label: 'Backing' },
  { id: 'rewardsPercent', label: 'Rewards %' },
  { id: 'change', label: 'Change' },
  { id: 'rewardsPast', label: 'Rewards', sublabel: 'past cycle' },
  { id: 'rewardsUpcoming', label: 'Rewards', sublabel: 'upcoming cycle' },
  { id: 'allocations', label: 'Allocations' },
]

export const BuilderTableColumnDropdown: FC<CommonComponentProps> = ({ className }) => {
  // FIXME: interact with the table context once ready
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className={className}>
      <DropdownSelector
        title="Table Columns"
        options={columnOptions}
        selected={selected}
        onChange={setSelected}
        trigger={
          <Button
            variant="secondary"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#39342A] transition-colors border-none"
          >
            <MoreIcon />
          </Button>
        }
      />
    </div>
  )
}
