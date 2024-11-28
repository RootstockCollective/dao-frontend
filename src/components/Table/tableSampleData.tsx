import { Typography } from '../Typography'
import { Link } from '../Link'

type TableDataType = {
  'Super Long Name Title': string
  'Super Long Symbol Description': string
  price: number
  holdings: number
  stake: boolean
}
// sample table data incorporating various data types
export const tableSampleData: TableDataType[] = [
  {
    'Super Long Name Title': 'd. Rootstock Infrastructure Framework',
    'Super Long Symbol Description': 'RIF',
    price: 0.5,
    holdings: 100_023_258,
    stake: true,
  },
  {
    'Super Long Name Title': 'b. Rootstock Bitcoin',
    'Super Long Symbol Description': 'RBTC',
    price: 64_000,
    holdings: 30_023_230,
    stake: false,
  },
  {
    'Super Long Name Title': 'c. Rootstock Tether USD',
    'Super Long Symbol Description': 'rUSDT',
    price: 1,
    holdings: 50_023_230,
    stake: true,
  },
  {
    'Super Long Name Title': 'a. Rootstock USDC',
    'Super Long Symbol Description': 'rUSDC',
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
