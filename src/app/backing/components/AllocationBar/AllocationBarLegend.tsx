import { Circle } from '@/components/Circle'
import { AllocationItem } from './types'

export const AllocationLegend = ({ items }: { items: AllocationItem[] }) => {
  return (
    <div className="flex items-center justify-center gap-x-4 mt-6 text-sm font-normal leading-5 text-v3-bg-accent-0 font-rootstock-sans">
      <span>Total portfolio:</span>
      {items.map(item => (
        <span key={item.key} className="flex items-center space-x-2">
          <Circle color={item.displayColor} />
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  )
}
