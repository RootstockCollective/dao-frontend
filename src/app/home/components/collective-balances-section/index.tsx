import { useTreasuryContext } from '@/app/treasury/contexts/TreasuryContext'
import { useStRifHoldings } from '@/app/treasury/hooks/useStRifHoldings'
import { BalanceInfo } from '@/components/BalanceInfo'
import { Header } from '@/components/TypographyNew'
import { formatCurrency } from '@/lib/utils'
import Big from '@/lib/big'
import { formatTokenBalance } from '@/app/user/Balances/balanceUtils'

export const CollectiveBalancesSection = () => {
  const { stRifBalance, stRifUsdBalance } = useStRifHoldings()
  const {
    buckets: { GENERAL, GRANTS, GRANTS_ACTIVE, GROWTH_REWARDS, GROWTH },
  } = useTreasuryContext()

  const rifTotal = Big(GENERAL?.RIF.amount || 0)
    .add(GRANTS?.RIF.amount || 0)
    .add(GRANTS_ACTIVE?.RIF.amount || 0)
    .add(GROWTH?.RIF.amount || 0)
    .add(GROWTH_REWARDS?.RIF.amount || 0)
    .ceil()

  const rifFiatTotal = Big(GENERAL?.RIF.fiatAmount || 0)
    .add(GRANTS?.RIF.fiatAmount || 0)
    .add(GRANTS_ACTIVE?.RIF.fiatAmount || 0)
    .add(GROWTH?.RIF.fiatAmount || 0)
    .add(GROWTH_REWARDS?.RIF.fiatAmount || 0)
    .toFixed(2)

  const rbtcTotal = Big(GENERAL?.RBTC.amount || 0)
    .add(GRANTS?.RBTC.amount || 0)
    .add(GRANTS_ACTIVE?.RBTC.amount || 0)
    .add(GROWTH?.RBTC.amount || 0)
    .add(GROWTH_REWARDS?.RBTC.amount || 0)

  const rbtcFiatTotal = Big(GENERAL?.RBTC.fiatAmount || 0)
    .add(GRANTS?.RBTC.fiatAmount || 0)
    .add(GRANTS_ACTIVE?.RBTC.fiatAmount || 0)
    .add(GROWTH?.RBTC.fiatAmount || 0)
    .add(GROWTH_REWARDS?.RBTC.fiatAmount || 0)
    .toFixed(2)

  const usdRifTotal = Big(GENERAL?.USDRIF.amount || 0)
    .add(GRANTS?.USDRIF.amount || 0)
    .add(GRANTS_ACTIVE?.USDRIF.amount || 0)
    .add(GROWTH?.USDRIF.amount || 0)
    .add(GROWTH_REWARDS?.USDRIF.amount || 0)

  return (
    <div className="bg-bg-80 p-6 mt-2">
      <Header variant="h3">THE COLLECTIVE BALANCES</Header>
      <div className="flex flex-row flex-wrap gap-6 mt-10">
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title={'RIF total'}
          amount={formatTokenBalance(rifTotal.toString(), 'RIF')}
          symbol="RIF"
          fiatAmount={formatCurrency(rifFiatTotal, { showCurrency: true })}
          tooltipContent={'This is the grand total of RIF in all parts of the Collective.'}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title={'stRIF total'}
          symbol="stRIF"
          amount={formatTokenBalance(stRifBalance.toString(), 'stRIF')}
          fiatAmount={stRifUsdBalance + ' USD'}
          tooltipContent={'This is the grand total of stRIF in all parts of the Collective.'}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title={'USDRIF total'}
          amount={formatTokenBalance(usdRifTotal.toString(), 'USDRIF')}
          symbol="USDRIF"
          fiatAmount={formatCurrency(usdRifTotal, { showCurrency: true })}
          tooltipContent={'This is the grand total of USDRIF in all parts of the Collective.'}
        />
        <BalanceInfo
          className="max-w-[214px] min-w-[180px]"
          title={'rBTC total'}
          symbol="RBTC"
          amount={formatTokenBalance(rbtcTotal.toString(), 'RBTC')}
          fiatAmount={formatCurrency(rbtcFiatTotal, { showCurrency: true })}
          tooltipContent={'This is the grand total of rBTC in all parts of the Collective.'}
        />
      </div>
    </div>
  )
}
