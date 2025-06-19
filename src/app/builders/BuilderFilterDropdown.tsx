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
  onSelected: (option: { id: string; content: ReactNode }) => void
}

const BuilderFilterOptions = [
  { id: 'active', content: 'Active builders' },
  { id: 'inactive', content: 'Inactive builders' },
  { id: 'all', content: 'All builders' },
]

export const BuilderFilterDropdown: FC<BuilderFilterDropdownProps> = ({ className, onSelected }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(BuilderFilterOptions[0].id)

  useEffect(() => {
    const selected = BuilderFilterOptions.find(opt => opt.id === selectedOptionId)
    if (selected) {
      onSelected(selected)
    }
  }, [selectedOptionId, onSelected])

  return (
    <Dropdown value={selectedOptionId} onValueChange={setSelectedOptionId}>
      <DropdownTrigger className={className} data-testid="dropdown-trigger">
        <DropdownValue />
      </DropdownTrigger>
      <DropdownContent>
        {BuilderFilterOptions.map(opt => (
          <DropdownItem key={opt.id} value={opt.id} data-testid={`dropdown-option-${opt.id}`}>
            {opt.content}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}

export default BuilderFilterDropdown
