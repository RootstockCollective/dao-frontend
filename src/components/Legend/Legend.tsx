import { Circle } from '@/components/Circle'
import { cn, truncate } from '@/lib/utils'
import { Span } from '../TypographyNew'

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
    <div className={cn('flex items-center justify-center gap-x-4 mt-6 text-v3-bg-accent-0', className)}>
      <Span variant="body-s" bold>
        {title}
      </Span>
      {items.map(({ key, label, displayColor }) => (
        <div key={key} className="flex items-center space-x-2">
          <Circle color={displayColor} />
          <Span variant="body-s">{truncate(label, 17)}</Span>
        </div>
      ))}
    </div>
  )
}
