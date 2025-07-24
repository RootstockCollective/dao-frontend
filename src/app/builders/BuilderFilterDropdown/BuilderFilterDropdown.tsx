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
  options?: BuilderFilterOption[]
}

export const BuilderFilterDropdown: FC<BuilderFilterDropdownProps> = ({
  className,
  onSelected,
  options = builderFilterOptions,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<BuilderFilterOptionId>(options[0].id)

  useEffect(() => {
    const isCurrentOptionAvailable = options.some(opt => opt.id === selectedOptionId)

    if (!isCurrentOptionAvailable && options.length > 0) {
      // If current option is not available, set to first option
      const newOptionId = options[0].id
      setSelectedOptionId(newOptionId)
      onSelected(newOptionId)
    } else {
      // If current option is available, call onSelected with current selection
      const selected = options.find(opt => opt.id === selectedOptionId)
      if (selected) {
        onSelected(selected.id)
      }
    }
  }, [options, selectedOptionId, onSelected])

  return (
    <Dropdown
      value={selectedOptionId}
      onValueChange={value => setSelectedOptionId(value as BuilderFilterOptionId)}
    >
      <DropdownTrigger className={className} data-testid="dropdown-trigger">
        <DropdownValue />
      </DropdownTrigger>
      <DropdownContent>
        {options.map(opt => (
          <DropdownItem key={opt.id} value={opt.id} data-testid={`dropdown-option-${opt.id}`}>
            {opt.content}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}

export default BuilderFilterDropdown
