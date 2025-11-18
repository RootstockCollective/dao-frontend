import { Header } from '@/components/Typography'
import { SelectableItem } from '@/components/SelectableItem'
import { FilterGroup, FilterOption } from './types'

interface Props {
  group: FilterGroup
  isAllSelected: (groupId: string) => boolean
  isFilterSelected: (groupId: string, option: FilterOption) => boolean
  onClearGroup: (groupId: string) => void
  onFilterToggle: (groupId: string, option: FilterOption) => void
}

/**
 * Displays a section of selectable filter options, including a "all" option and the individual options.
 * Supports both multi- and single-select variants.
 */
export function FilterSection({
  group,
  isAllSelected,
  isFilterSelected,
  onClearGroup,
  onFilterToggle,
}: Props) {
  return (
    <div>
      <Header variant="h5" className="mb-4 text-text-40" caps>
        {group.title}
      </Header>
      <ul className="pl-1 space-y-3" role="group">
        <li>
          <SelectableItem
            selected={isAllSelected(group.id)}
            option={{ label: group.allLabel, value: '' }}
            onClick={() => onClearGroup(group.id)}
            data-testid={group.allTestId}
            variant={group.isMultiSelect ? 'square' : 'round'}
          />
        </li>
        {group.options.map((option, i) => (
          <li key={i}>
            <SelectableItem
              selected={isFilterSelected(group.id, option)}
              option={option}
              onClick={() => onFilterToggle(group.id, option)}
              data-testid={`${group.id}Filter-${option.label}`}
              variant={group.isMultiSelect ? 'square' : 'round'}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
