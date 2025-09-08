import { CommonComponentProps } from '@/components/commonProps'
import { Column, useTableContext } from '@/shared/context'
import { ReactElement } from 'react'
import { BackerRewardsCellDataMap, ColumnId } from '../TableDesktop/BackerRewardsTable.config'

const headerDataToHeaderCellMapper = (data: Column<ColumnId>): ReactElement => {
  return (
    <div key={data.id} className="">
      {'placeholder for header cell'}
    </div>
  )
}

const bodyDataToBodyCellMapper = <T extends ColumnId = ColumnId>({
  columnId,
  data,
}: {
  columnId: T
  data: BackerRewardsCellDataMap[T]
}): ReactElement => {
  return (
    <div key={columnId} className="">
      {'placeholder for body cell'}
    </div>
  )
}

interface TableMDProps extends CommonComponentProps {
  //   headers: BackerTableHeaderData[]
  //   body: BackerTableBodyData[]
}

export const TableMD = ({}: TableMDProps): ReactElement => {
  const { rows, columns, selectedRows, sort } = useTableContext<ColumnId, BackerRewardsCellDataMap>() // FIXME: @jurajpiar - generalise

  return (
    <div data-testid="table-md" className="">
      <div id="table-md-header" className="">
        {columns.map(headerDataToHeaderCellMapper)}
      </div>

      <div id="table-md-body" className="">
        {rows.map(bodyDataToBodyCellMapper)}
      </div>
    </div>
  )
}
