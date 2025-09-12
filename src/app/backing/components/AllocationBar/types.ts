import { Address } from 'viem'

export interface AllocationItem {
  key: Address
  label: string
  value: bigint // actual value (not percentage)
  displayColor: string
  isTemporary?: boolean // true: it shows a checkerboard pattern on the segment
  initialValue?: bigint
  isEditable: boolean
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
    valueDecimals?: IntRange<1, 20>
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

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>> | F
