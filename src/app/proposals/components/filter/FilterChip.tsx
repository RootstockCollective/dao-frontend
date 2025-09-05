import { TrashIcon } from '@/components/Icons'
import { cn } from '@/lib/utils'
import { FilterItem } from './types'
import { Paragraph } from '@/components/Typography'
import { Button } from '@/components/Button'

interface FilterChipProps {
  filter: FilterItem
  onRemove: (id: string) => void
  className?: string
}

export const FilterChip = ({ filter, onRemove, className }: FilterChipProps) => {
  const handleRemove = () => {
    onRemove(filter.id)
  }

  return (
    <div
      className={cn('inline-flex items-center whitespace-nowrap flex-shrink-0 mr-4', className)}
      data-testid={`FilterChip-${filter.type}-${filter.value}`}
    >
      <Button
        onClick={handleRemove}
        variant="transparent"
        className="hover:bg-black/10 rounded-full transition-colors p-0"
        aria-label={`Remove ${filter.type} filter: ${filter.label}`}
        data-testid={`RemoveFilter-${filter.id}`}
      >
        <TrashIcon size={16} className="text-white" />
      </Button>
      <Paragraph variant="body-s" className="text-white ml-1">
        {filter.label}
      </Paragraph>
    </div>
  )
}
