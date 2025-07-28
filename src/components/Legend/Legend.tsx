import { Circle } from '@/components/Circle'
import { cn, truncate } from '@/lib/utils'

interface LegendItem {
  key: string
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
        'flex items-center justify-center gap-x-4 text-sm font-normal leading-5 text-v3-bg-accent-0 font-rootstock-sans',
        className,
      )}
    >
      <span>{title}</span>
      {items.map(({ key, label, displayColor }) => (
        <span key={key} className="flex items-center space-x-2">
          <Circle color={displayColor} />
          <span>{truncate(label, 17)}</span>
        </span>
      ))}
    </div>
  )
}
