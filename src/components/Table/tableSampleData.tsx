import { Typography } from '../Typography'
import { Link } from '../Link'

// sample table data incorporating various data types
const tableSource = [
  {
    name: 'Rootstock Infrastructure Framework',
    symbol: 'RIF',
    price: 0.5,
    holdings: 100_023_258n,
    stake: true,
  },
  {
    name: 'Rootstock Bitcoin',
    symbol: 'RBTC',
    price: 64_000,
    holdings: 30_023_230n,
    stake: false,
  },
  {
    name: 'Rootstock Tether USD',
    symbol: 'rUSDT',
    price: 1,
    holdings: 50_023_230n,
    stake: true,
  },
  {
    name: 'Rootstock USDC',
    symbol: 'rUSDC',
    price: 1.01,
    holdings: 36_456_745n,
    stake: false,
  },
]
// it may be necessary to preprocess the data before rendering it in the table
export const tableSampleData = tableSource.map(el => ({
  ...el,
  price: (
    <Typography tagVariant="p">
      {el.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    </Typography>
  ),
  holdings: (
    <Typography
      tagVariant="p"
      className="whitespace-nowrap"
    >{`${el.holdings.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${el.symbol}`}</Typography>
  ),
  stake: (
    <Link className="text-[#8F9AFF]" href={`/${el.stake ? 'stake' : 'unstake'}`}>
      {el.stake ? 'Stake' : 'Unstake'}
    </Link>
  ),
}))
