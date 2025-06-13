import { TableColumnSelector } from './TableColumnSelector'

export default {
  title: 'Builders/TableColumnSelector',
  component: TableColumnSelector,
}

export const Basic = () => (
  <TableColumnSelector className="flex justify-end items-start p-10 min-h-[200px] w-[500px] relative" />
)
