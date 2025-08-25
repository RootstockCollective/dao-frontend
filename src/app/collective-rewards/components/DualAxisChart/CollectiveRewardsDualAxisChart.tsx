'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  CartesianGrid,
} from 'recharts'
import { BackingPoint, CycleWindow, RewardsPoint } from '@/app/collective-rewards/types'
import { convertToTimestamp, formatShort } from '@/app/collective-rewards/utils/chartUtils'
import { useMergedSeries } from '@/app/collective-rewards/shared/hooks/useMergeSeries'
import { CollectiveRewardsChartTooltipContent } from './CollectiveRewardsChartTooltipContent'

interface DualAxisChartProps {
  backingSeries: BackingPoint[]
  rewardsSeries: RewardsPoint[]
  colors?: {
    backing?: string
    rewards?: string
  }
  cycles?: CycleWindow[]
  yLeftLabel?: string
  yRightLabel?: string
  height?: number
  stackRewards?: boolean
}

export function CollectiveRewardsDualAxisChart({
  backingSeries,
  rewardsSeries,
  colors = {
    backing: 'var(--brand-rif-blue)',
    rewards: 'var(--brand-rootstock-lime)',
  },
  cycles = [],
  yLeftLabel = 'BACKING',
  yRightLabel = 'REWARDS',
  height = 420,
}: DualAxisChartProps) {
  const data = useMergedSeries(backingSeries, rewardsSeries)

  const rewardsMaxDomain = useMemo<[number, number]>(() => {
    if (!data.length) return [0, 100]

    const maxRewards = Math.max(
      ...data.map(d => {
        const usd = d.rewardsUSD || 0
        const rif = d.rewardsRif || 0
        const rbtc = d.rewardsRbtc || 0
        // Use USD if available, otherwise sum RIF + RBTC
        return usd > 0 ? usd : rif + rbtc
      }),
    )

    const maxWithBuffer = maxRewards * 3
    return [0, maxWithBuffer]
  }, [data])

  const xDomain = useMemo<[number, number] | undefined>(() => {
    if (!data.length) return undefined
    const first = data[0].day instanceof Date ? data[0].day.getTime() : +new Date(data[0].day)
    const last =
      data[data.length - 1].day instanceof Date
        ? data[data.length - 1].day.getTime()
        : +new Date(data[data.length - 1].day)
    const oneMonthInMs = 30 * 24 * 60 * 60 * 1000
    return [first, last + oneMonthInMs]
  }, [data])

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 60, bottom: 10 }} stackOffset="none">
          <XAxis
            dataKey={(p: any) => (p.day instanceof Date ? p.day.getTime() : p.day)}
            type="number"
            domain={xDomain ?? ['auto', 'auto']}
            tickFormatter={v => new Date(v).toLocaleString(undefined, { month: 'short' }).toUpperCase()}
            tickMargin={10}
            axisLine={true}
            tickLine={false}
            interval={0}
            tick={{ fill: 'var(--background-0)' }}
            className="font-rootstock-sans text-sm"
            tickCount={10}
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={formatShort}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#7C89F5' }}
            label={{
              value: yLeftLabel,
              angle: 0,
              position: 'top',
              offset: 40,
              fill: '#7C89F5',
              fontSize: 12,
            }}
            domain={[0, 'auto']}
            className="font-rootstock-sans text-sm"
          />

          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={formatShort}
            axisLine={false}
            tickLine={false}
            tick={{ fill: colors.rewards }}
            label={{
              value: yRightLabel,
              angle: 0,
              position: 'top',
              offset: 40,
              fill: colors.rewards,
              fontSize: 12,
            }}
            domain={rewardsMaxDomain}
            className="font-rootstock-sans text-sm"
          />

          <Tooltip content={<CollectiveRewardsChartTooltipContent />} wrapperStyle={{ outline: 'none' }} />

          <Area
            type="monotone"
            yAxisId="left"
            dataKey="backing"
            stroke={colors.backing}
            fill={colors.backing}
            strokeWidth={2}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 6 }}
          />

          <Area
            type="monotone"
            yAxisId="right"
            dataKey="rewardsUSD"
            stroke={colors.rewards}
            fill={colors.rewards}
            strokeWidth={2}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 6 }}
          />

          <CartesianGrid fill="var(--background-40)" fillOpacity={0.1} stroke="transparent" />

          {cycles?.map((c, i) => {
            if (i % 2 === 0) return null

            return (
              <ReferenceArea
                key={`shade-${i}`}
                x1={c.start instanceof Date ? c.start.getTime() : +new Date(c.start)}
                x2={c.end instanceof Date ? c.end.getTime() : +new Date(c.end)}
                y1={0}
                y2={9999999}
                fill="var(--background-100)"
                fillOpacity={0.2}
                ifOverflow="extendDomain"
              />
            )
          })}

          {cycles?.map((c, i) => (
            <ReferenceLine
              key={`line-${i}`}
              x={convertToTimestamp(c.start)}
              stroke="transparent"
              label={{
                value: c.label,
                position: 'insideBottomLeft',
                offset: 15,
                fill: 'white',
                fontSize: 11,
                fontFamily: 'var(--font-rootstock-sans)',
                style: { mixBlendMode: 'exclusion' },
              }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
