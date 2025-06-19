import { FC, ReactNode, useEffect, useState } from 'react'
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownValue,
} from '../../components/SingleSelectDropdown/SingleSelectDropdown'

export interface BuilderFilterDropdownProps {
  className?: string
  onSelected?: (option: { id: string; content: ReactNode }) => void
}

const BuilderFilterOptions = [
  { id: 'active', content: 'Active builders' },
  { id: 'inactive', content: 'Inactive builders' },
  { id: 'all', content: 'All builders' },
]

export const BuilderFilterDropdown: FC<BuilderFilterDropdownProps> = ({ className, onSelected }) => {
  const [value, setValue] = useState<string>(BuilderFilterOptions[0].id)

  useEffect(() => {
    const selected = BuilderFilterOptions.find(opt => opt.id === value)
    if (selected && onSelected) {
      onSelected(selected)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <Dropdown value={value} onValueChange={setValue}>
      <DropdownTrigger className={className} data-testid="dropdown-trigger">
        <DropdownValue />
      </DropdownTrigger>
      <DropdownContent>
        {dummyOptions.map(opt => (
          <DropdownItem key={opt.id} value={opt.id} data-testid={`dropdown-option-${opt.id}`}>
            {opt.content}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}

export default BuilderFilterDropdown
