import { CommonComponentProps } from '@/components/commonProps'
import { FC, useEffect, useState } from 'react'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  DropdownValue,
} from '../../components/SingleSelectDropdown/SingleSelectDropdown'
import { BuilderState } from './components/Table/BuilderTable.config'

export interface BuilderFilterDropdownProps extends CommonComponentProps {
  onSelected: (optionId: BuilderFilterOptionId) => void
}

export type BuilderFilterOptionId = 'all' | Exclude<BuilderState, 'selfPaused'>

export type BuilderFilterOption = {
  id: BuilderFilterOptionId
  content: string
}

const builderFilterOptions: BuilderFilterOption[] = [
  { id: 'all', content: 'All Builders' },
  { id: 'active', content: 'Active Builders' },
  { id: 'deactivated', content: 'Deactivated Builders' },
  { id: 'revoked', content: 'Revoked Builders' },
  { id: 'paused', content: 'Paused Builders' },
  { id: 'inProgress', content: 'In Progress' },
]

export const BuilderFilterDropdown: FC<BuilderFilterDropdownProps> = ({ className, onSelected }) => {
  const [selectedOptionId, setSelectedOptionId] = useState<BuilderFilterOptionId>(builderFilterOptions[0].id)

  useEffect(() => {
    const selected = builderFilterOptions.find(opt => opt.id === selectedOptionId)
    if (selected) {
      onSelected(selected.id)
    }
  }, [selectedOptionId, onSelected])

  return (
    <Dropdown
      value={selectedOptionId}
      onValueChange={value => setSelectedOptionId(value as BuilderFilterOptionId)}
    >
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
