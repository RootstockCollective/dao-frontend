import { HTMLAttributes } from 'react'
import { PizzaChartDetails, Segment } from './PizzaChartDetails'

interface PizzaChartProps extends HTMLAttributes<HTMLDivElement> {
  values: Segment[]
}

export function PizzaChart({ children }: PizzaChartProps) {
  return <div>SmallPieGraph</div>
}
