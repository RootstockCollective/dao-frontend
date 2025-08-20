import { Address } from 'viem'

export interface AllocationItem {
  key: Address | string
  label: string
  value: bigint // actual value (not percentage)
  displayColor: string
  isTemporary?: boolean // true: it shows a checkerboard pattern on the segment
  initialValue?: bigint
}

export interface AllocationChangeData {
  type: 'resize' | 'reorder'
  values: bigint[]
  itemsData: AllocationItem[]
  increasedIndex: number
  decreasedIndex: number
}

export interface AllocationBarValueDisplay {
  showPercent?: boolean
  showValue?: boolean
  format?: {
    percentDecimals?: number
    valueDecimals?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20
  }
}

export interface AllocationBarProps {
  itemsData: AllocationItem[]
  isDraggable?: boolean
  isResizable?: boolean
  height?: string
  valueDisplay?: AllocationBarValueDisplay
  showLegend?: boolean
  className?: string
  onChange?: (data: AllocationChangeData) => void
}
