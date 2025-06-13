import { FC, useState } from 'react'
import { CommonComponentProps } from '@/components/commonProps'
import { Button } from '@/components/Button'
import { MoreIcon } from '@/components/Icons/MoreIcon'
import { Dropdown } from '@/components/dropdownV3/Dropdown'
import { DropdownSelectableItem } from '@/components/dropdownV3/DropdownSelectableItem'
import { CloseIcon } from '@/components/Icons/CloseIcon'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

interface ColumnOption {
  id: string
  label: string
  sublabel?: string
}

const columnOptions: ColumnOption[] = [
  { id: 'builder', label: 'Builder' },
  { id: 'backing', label: 'Backing' },
  { id: 'rewardsPercent', label: 'Rewards %' },
  { id: 'change', label: 'Change' },
  { id: 'rewardsPast', label: 'Rewards', sublabel: 'past cycle' },
  { id: 'rewardsUpcoming', label: 'Rewards', sublabel: 'upcoming cycle' },
  { id: 'allocations', label: 'Allocations' },
]

export const TableColumnSelector: FC<CommonComponentProps> = ({ className }) => {
  // FIXME: interact with the table context once ready
  const [selected, setSelected] = useState<string[]>([])

  const handleItemClick = (itemId: string) => {
    setSelected(prev => (prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]))
  }

  return (
    <div className={className}>
      <Dropdown
        title="Table Columns"
        trigger={(isOpen: boolean) => (
          <Button variant="secondary" className="p-0 border-none">
            {isOpen ? <CloseIcon /> : <MoreIcon />}
          </Button>
        )}
      >
        {columnOptions.map(item => (
          <DropdownMenu.Item
            key={item.id}
            className="outline-none"
            onSelect={e => {
              e.preventDefault()
              handleItemClick(item.id)
            }}
          >
            <DropdownSelectableItem
              label={item.label}
              sublabel={item.sublabel}
              checked={selected.includes(item.id)}
            />
          </DropdownMenu.Item>
        ))}
      </Dropdown>
    </div>
  )
}
