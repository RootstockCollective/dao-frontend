import { REWARD_TOKEN_KEYS, RewardTokenKey, TOKENS } from '@/lib/tokens'
import Big from 'big.js'
import { MetricToken } from '../components/Metric/types'
import { createMetricToken } from '../components/Metric/utils'
import { GetPricesResult } from '../user/types'
import { getFiatAmount } from './formatter'

export const getMetricTokens = (tokens: Record<RewardTokenKey, bigint>, prices: GetPricesResult) =>
  REWARD_TOKEN_KEYS.reduce<{ metricTokens: MetricToken[]; total: Big }>(
    ({ metricTokens, total }, tokenKey) => {
      const { symbol } = TOKENS[tokenKey]
      const value = tokens[tokenKey]
      const price = prices[symbol]?.price ?? 0

      return {
        metricTokens: [...metricTokens, createMetricToken({ value, price, symbol })],
        total: total.add(getFiatAmount(value, prices[symbol]?.price ?? 0)),
      }
    },
    {
      metricTokens: [],
      total: Big(0),
    },
  )
