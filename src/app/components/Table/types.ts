import { BaseColumnId } from '@/shared/context'
import { HtmlHTMLAttributes } from 'react'

export type ColumnTransforms<CID extends BaseColumnId = BaseColumnId> = Record<
  CID,
  HtmlHTMLAttributes<HTMLTableCellElement>['className']
>
