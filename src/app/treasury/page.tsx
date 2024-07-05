'use client'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { Header } from '@/components/Typography'
import { MetricsCard } from '@/components/MetricsCard'
import { Table } from '@/components/Table'

export default function Treasury() {
  return (
    <MainContainer>
      <div className="pl-[24px] grid grid-rows-1 gap-[32px] mb-[100px]">
        <TreasurySection />
        <TotalTokenHoldingsSection />
        <Distribution />
      </div>
    </MainContainer>
  )
}

const TreasurySection = () => (
  <div>
    <Header variant="h2" className="mb-[17px]">
      Treasury
    </Header>
    <div className="grid grid-cols-3 gap-[24px]">
      <MetricsCard title="Treasury RIF Holdings" amount="936.26m RIF" fiatAmount="= $ USD 14,045.00" />
      <MetricsCard title="Total RIF Volume" amount="936.26m RIF" fiatAmount="= $ USD 14,045.00" />
      <MetricsCard title="Liquid RIF Holdings" amount="936.26m RIF" fiatAmount="= $ USD 14,045.00" />
      <MetricsCard title="Treasury rBTC Holdings" amount="936.26m rBTC" fiatAmount="= $ USD 14,045.00" />
      <MetricsCard title="Total rBTC Volume" amount="936.26m rBTC" fiatAmount="= $ USD 14,045.00" />
      <MetricsCard title="Liquid rBTC Holdings" amount="936.26m rBTC" fiatAmount="= $ USD 14,045.00" />
    </div>
  </div>
)

const tableData = [
  {
    token: 'Rootstock Infrastructure Framework',
    symbol: 'RIF',
    price: '$240,00',
    holdings: '100,023,258,00 RIF',
  },
  {
    token: 'Rootstock Bitcoin',
    symbol: 'rBTC',
    price: '-',
    holdings: '30,023,230.00 rBTC',
  },
  {
    token: 'Staked Rootstock Infrastructure Framework',
    symbol: 'stRIF',
    price: '$110,23',
    holdings: '50,023,503.00 stRIF',
  },
]

const TotalTokenHoldingsSection = () => (
  <div>
    <Header variant="h2" className="mb-[17px]">
      Total token holdings
    </Header>
    <Table data={tableData} />
  </div>
)

const Distribution = () => (
  <div>
    <Header variant="h2">Distribution</Header>
    <Header variant="span" className="mb-[17px]">
      Payouts from the treasury
    </Header>
    <Table data={tableData} />
  </div>
)
