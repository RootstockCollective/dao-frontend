import { HtmlHTMLAttributes } from 'react'
import { BuilderState } from '../types'

export * from './applyPrecision'
export * from './getBuilderGauge'
export * from './getBuilderState'
export * from './getCoinbaseAddress'
export * from './getMostAdvancedProposal'
export * from './handleErrors'

export const crStatusLabels: Record<BuilderState, string> = {
  active: 'Active',
  inProgress: 'In Progress',
} as const

export const crStatusColorClasses: Record<BuilderState, HtmlHTMLAttributes<HTMLSpanElement>['className']> = {
  active: 'bg-[#DBFEE5] text-secondary',
  inProgress: 'bg-[#4B5CF0] color-text-primary',
} as const
