import { CheckboxChecked } from '@/components/Icons/CheckboxChecked'
import { CheckboxUnchecked } from '@/components/Icons/CheckboxUnchecked'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { FC } from 'react'

interface MultipleSelectDropdownItemProps {
  label: string
  sublabel?: string
  checked: boolean
  className?: string
}

export const MultipleSelectDropdownItem: FC<MultipleSelectDropdownItemProps> = ({
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
