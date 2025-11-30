import { LegendItem } from '@/components/Legend'

export interface AllocationItem extends LegendItem {
  value: bigint
  isTemporary?: boolean
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
  useModal?: boolean
}

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>> | F
