import { Circle } from '@/components/Circle'
import { cn, truncate } from '@/lib/utils'
import { Address } from 'viem'

export interface LegendItem {
  key: Address
  label: string
  displayColor: string
}

interface LegendProps {
  title: string
  className?: string
  items: LegendItem[]
}

export const Legend = ({ title, className, items }: LegendProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-sm font-normal leading-5 text-v3-bg-accent-0 font-rootstock-sans',
        className,
      )}
    >
      <span>{title}</span>
      {items.map(({ key, label, displayColor }) => (
        <span key={key} className="flex items-center space-x-2">
          <Circle color={displayColor} />
          <span className="whitespace-nowrap">{truncate(label, 17)}</span>
        </span>
      ))}
    </div>
  )
}
