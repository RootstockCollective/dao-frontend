import { AllocationItem } from "./types"

export const AllocationLegend = ({ items }: { items: AllocationItem[] }) => {
  return (
    <div className="flex items-center justify-center space-x-4 mt-2 text-lg font-medium text-v3-text-0">
      <span>Total portfolio:</span>
      {items.map(item => (
        <span key={item.key} className="flex items-center space-x-2">
          <span
            className="inline-block w-4 h-4 rounded-full"
            style={{ backgroundColor: item.displayColor }}
          ></span>
          <span>{item.label}</span>
        </span>
      ))}
    </div>
  )
}
