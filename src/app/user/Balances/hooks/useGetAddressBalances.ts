import { useGetAddressTokens } from '@/app/user/utils'
import { useMemo } from 'react'
import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { TokenBalanceRecord } from '@/app/user/types'

export const useGetAddressBalances = (): TokenBalanceRecord => {
  const query = useGetAddressTokens()

  const rif = useMemo(() => getTokenBalance('RIF', query.data ?? []), [query.data])
  const rbtc = useMemo(() => getTokenBalance('rBTC', query.data ?? []), [query.data])
  // TODO get stRIF
  const strif = useMemo(() => ({ balance: '0', symbol: 'stRIF' }), [query.data])
  return {
    rif,
    rbtc,
    strif
  }
}
