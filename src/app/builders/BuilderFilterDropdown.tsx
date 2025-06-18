import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  DropdownValue,
} from '@/components/SingleSelectDropdown/SingleSelectDropdown'
import { FC, useEffect, useState } from 'react'

const builderFilterOptions = [
  { id: 'all', content: 'All builders' },
  { id: 'active', content: 'Active builders' },
  { id: 'inactive', content: 'Inactive builders' },
  { id: 'deactivated', content: 'Deactivated builders' },
  { id: 'revoked', content: 'Revoked builders' },
  { id: 'paused', content: 'Paused builders' },
  { id: 'in-progress', content: 'In Progress' },
] as const

export type BuilderFilterOption = (typeof builderFilterOptions)[number]['id']

export interface BuilderFilterDropdownProps {
  className?: string
  onSelected: (id: BuilderFilterOption) => void
}

export const BuilderFilterDropdown: FC<BuilderFilterDropdownProps> = ({ className, onSelected }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(builderFilterOptions[0].id)

  useEffect(() => {
    const selected = builderFilterOptions.find(opt => opt.id === selectedOptionId)
    if (selected) {
      onSelected(selected.id)
    }
  }, [selectedOptionId, onSelected])

  return (
    <Dropdown value={selectedOptionId} onValueChange={setSelectedOptionId}>
      <DropdownTrigger className={className} data-testid="dropdown-trigger">
        <DropdownValue />
      </DropdownTrigger>
      <DropdownContent>
        {builderFilterOptions.map(opt => (
          <DropdownItem key={opt.id} value={opt.id} data-testid={`dropdown-option-${opt.id}`}>
            {opt.content}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}

export default BuilderFilterDropdown
