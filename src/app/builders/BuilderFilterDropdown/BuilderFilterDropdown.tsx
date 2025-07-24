import { CommonComponentProps } from '@/components/commonProps'
import { FC, useEffect, useState } from 'react'
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  DropdownValue,
} from '../../../components/SingleSelectDropdown/SingleSelectDropdown'
import { builderFilterOptions, type BuilderFilterOption, type BuilderFilterOptionId } from './constants'

export interface BuilderFilterDropdownProps extends CommonComponentProps {
  onSelected: (optionId: BuilderFilterOptionId) => void
}

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
