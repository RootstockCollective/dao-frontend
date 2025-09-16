import { Span } from '@/components/Typography'
import { TrashIcon } from '@/components/Icons'
import { BuilderFilterOption } from './BuilderFilterDropdown'

interface MobileCurrentFilterProps {
  currentFilterOption: BuilderFilterOption | null
  onClearFilter: () => void
}

export const MobileCurrentFilter = ({ currentFilterOption, onClearFilter }: MobileCurrentFilterProps) => {
  if (!currentFilterOption || currentFilterOption.id === 'all') return null

  return (
    <div className="w-full flex items-center justify-left">
      <Span variant="body-xs" className="text-v3-text-40">
        FILTERING BY:
      </Span>
      <TrashIcon size={16} className="text-v3-text-100 cursor-pointer ml-4 mr-1" onClick={onClearFilter} />
      <Span variant="body-s">{currentFilterOption.label}</Span>
    </div>
  )
}
