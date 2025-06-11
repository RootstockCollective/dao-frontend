// DropdownSelectorItem for v3
// Renders a single selector item with label, sublabel, and checkbox
// Used by DropdownSelector
import { CheckboxChecked } from '@/components/Icons/CheckboxChecked'
import { CheckboxUnchecked } from '@/components/Icons/CheckboxUnchecked'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'

export interface DropdownSelectorItemProps {
  label: string
  sublabel?: string
  checked: boolean
  className?: string
}

export const DropdownSelectorItem: React.FC<DropdownSelectorItemProps> = ({
  label,
  sublabel,
  checked,
  className,
}) => {
  return (
    <label
      className={cn(
        'flex items-center gap-2 pt-2 rounded cursor-pointer select-none transition-colors',
        className,
      )}
    >
      <span className="w-5 h-5 flex items-center justify-center">
        {checked ? <CheckboxChecked /> : <CheckboxUnchecked />}
      </span>
      <span className="flex items-center whitespace-nowrap">
        <Paragraph className="leading-none">{label}</Paragraph>
        {sublabel && (
          <Paragraph className={cn('text-xs text-v3-bg-accent-0 ml-2 leading-none')}>{sublabel}</Paragraph>
        )}
      </span>
    </label>
  )
}
