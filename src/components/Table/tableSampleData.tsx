import { Typography } from '../Typography'
import { Link } from '../Link'

type TableDataType = {
  name: string
  symbol: string
  price: number
  holdings: number
  stake: boolean
}
// sample table data incorporating various data types
export const tableSampleData: TableDataType[] = [
  {
    name: 'd. Rootstock Infrastructure Framework',
    symbol: 'RIF',
    price: 0.5,
    holdings: 100_023_258,
    stake: true,
  },
  {
    name: 'b. Rootstock Bitcoin',
    symbol: 'RBTC',
    price: 64_000,
    holdings: 30_023_230,
    stake: false,
  },
  {
    name: 'c. Rootstock Tether USD',
    symbol: 'rUSDT',
    price: 1,
    holdings: 50_023_230,
    stake: true,
  },
  {
    name: 'a. Rootstock USDC',
    symbol: 'rUSDC',
    price: 1.01,
    holdings: 36_456_745,
    stake: false,
  },
]

// rendering functions for the last 3 table columns
export const columnRenderingFuncs = {
  price: (val: number) => (
    <Typography tagVariant="p">
      {val.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </Typography>
  ),
  holdings: (val: number, row: Record<string, string>) => (
    <Typography
      tagVariant="p"
      className="whitespace-nowrap"
    >{`${val.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${row.symbol}`}</Typography>
  ),
  stake: (val: boolean) => (
    <Link className="text-[#8F9AFF]" href={`/${val ? 'stake' : 'unstake'}`}>
      {val ? 'Stake' : 'Unstake'}
    </Link>
  ),
}
