import { FC, useState } from 'react'
import { CommonComponentProps } from '@/components/commonProps'
import { Button } from '@/components/Button'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { DropdownSelector, SelectorOption } from '@/components/DropdownSelector/DropdownSelector'
import { CloseIcon } from '@/components/Icons/CloseIcon'

const columnOptions: SelectorOption[] = [
  { id: 'builder', label: 'Builder' },
  { id: 'backing', label: 'Backing' },
  { id: 'rewardsPercent', label: 'Rewards %' },
  { id: 'change', label: 'Change' },
  { id: 'rewardsPast', label: 'Rewards', sublabel: 'past cycle' },
  { id: 'rewardsUpcoming', label: 'Rewards', sublabel: 'upcoming cycle' },
  { id: 'allocations', label: 'Allocations' },
]

export const TableColumnDropdown: FC<CommonComponentProps> = ({ className }) => {
  // FIXME: interact with the table context once ready
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className={className}>
      <DropdownSelector
        title="Table Columns"
        options={columnOptions}
        selected={selected}
        onChange={setSelected}
        trigger={isOpen => (
          <Button variant="secondary" className="p-0 border-none">
            {isOpen ? <CloseIcon /> : <MoreIcon />}
          </Button>
        )}
      />
    </div>
  )
}
