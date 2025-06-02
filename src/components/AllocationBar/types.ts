export interface AllocationItem {
  key: string
  label: string
  value: number // percentage
  color: string // Tailwind class for color
  displayColor: string // Hex or Tailwind for dot
  isTemporary?: boolean // true: it shows a checkerboard pattern on the segment
}

export interface AllocationBarProps {
  initialItemsData?: AllocationItem[]
  showPercent?: boolean
  showLegend?: boolean
  className?: string
  onChange?: (values: number[]) => void
}
