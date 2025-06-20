export interface AllocationItem {
  key: string
  label: string
  value: number // actual value (not percentage)
  displayColor: string
  isTemporary?: boolean // true: it shows a checkerboard pattern on the segment
}

export interface AllocationChangeData {
  values: number[]
  itemsData: AllocationItem[]
  increasedIndex: number
  decreasedIndex: number
  totalValue: number
}

export interface AllocationBarValueDisplay {
  showPercent?: boolean
  showValue?: boolean
  format?: {
    percentDecimals?: number
    valueDecimals?: number
  }
}

export interface AllocationBarProps {
  initialItemsData?: AllocationItem[]
  isDraggable?: boolean
  isResizable?: boolean
  height?: string
  valueDisplay?: AllocationBarValueDisplay
  showLegend?: boolean
  className?: string
  onChange?: (data: AllocationChangeData) => void
}
