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
import { ChartTooltipContent } from './ChartTooltipContent'
import {
  CHART_BUFFER_PERCENTAGE,
  REWARDS_DOMAIN_BUFFER,
  DEFAULT_CHART_HEIGHT,
  X_DOMAIN_BUFFER,
  ONE_DAY_IN_MS,
} from '@/app/collective-rewards/constants/chartConstants'

/**
 * Custom cursor component that draws a vertical line from the X-axis to the backing data point.
 * Created because Recharts' default cursor goes full height.
 * Calculates the backing Y position using the actual data value and chart scale.
 * Also renders active dots with higher z-index to appear above the line.
 */
interface CustomCursorProps {
  points?: Array<{ x: number; y: number }>
  top?: number
  height?: number
  payload?: Array<{ dataKey: string; value: number; color?: string }>
  backingMaxDomain: number
  rewardsMaxDomain: number
}

const CustomCursor = (props: CustomCursorProps) => {
  const { points, top, height, payload, backingMaxDomain, rewardsMaxDomain } = props
  if (!points || points.length < 2 || !top || !height || !payload) return null

  const x = points[0].x
  const chartBottom = top + height

  const backingPayload = payload.find(p => p.dataKey === 'backing')
  const backingValue = backingPayload?.value || 0
  const hasBackingData = backingValue > 0

  const valueRatio = backingValue / backingMaxDomain
  const backingY = chartBottom - valueRatio * height

  return (
    <g style={{ pointerEvents: 'none' }}>
      {hasBackingData && (
        <line
          x1={x}
          y1={chartBottom}
          x2={x}
          y2={backingY}
          stroke="black"
          strokeOpacity={0.6}
          strokeWidth={1}
        />
      )}

      {/* Active dots with higher z-index */}
      {payload.map((payloadItem, index) => {
        if (
          !payloadItem ||
          payloadItem.value === null ||
          payloadItem.value === undefined ||
          payloadItem.value === 0
        )
          return null

        let calculatedY: number
        if (payloadItem.dataKey === 'backing') {
          const ratio = payloadItem.value / backingMaxDomain
          calculatedY = chartBottom - ratio * height
        } else {
          const ratio = payloadItem.value / rewardsMaxDomain
          calculatedY = chartBottom - ratio * height
        }

        return (
          <circle
            key={`active-dot-${index}`}
            cx={x}
            cy={calculatedY}
            r={8}
            fill={payloadItem.color}
            stroke="var(--background-100)"
            strokeWidth={6}
            style={{ zIndex: 1000 }}
          />
        )
      })}
    </g>
  )
}

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
  height = DEFAULT_CHART_HEIGHT,
}: DualAxisChartProps) {
  const data = useMergedSeries(backingSeries, rewardsSeries, cycles)

  const backingMaxDomain = useMemo(() => {
    if (!data.length) return 100
    const maxBacking = Math.max(...data.map(d => d.backing || 0))
    return maxBacking * CHART_BUFFER_PERCENTAGE
  }, [data])

  const rewardsMaxDomain = useMemo<[number, number]>(() => {
    if (!data.length) return [0, 100]

    const maxRewards = Math.max(
      ...data.map(d => {
        const usd = d.rewardsUSD || 0
        const rif = d.rewardsRif || 0
        const rbtc = d.rewardsRbtc || 0
        return usd > 0 ? usd : rif + rbtc
      }),
    )

    const maxWithBuffer = maxRewards * REWARDS_DOMAIN_BUFFER
    return [0, maxWithBuffer]
  }, [data])

  const xDomain = useMemo<[number, number] | undefined>(() => {
    if (!data.length) return undefined
    const first = data[0].day instanceof Date ? data[0].day.getTime() : +new Date(data[0].day)
    const last =
      data[data.length - 1].day instanceof Date
        ? data[data.length - 1].day.getTime()
        : +new Date(data[data.length - 1].day)
    return [first, last + X_DOMAIN_BUFFER]
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
            tickCount={6}
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
            domain={[0, backingMaxDomain]}
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

          <Area
            type="monotone"
            yAxisId="left"
            dataKey="backing"
            stroke={colors.backing}
            fill={colors.backing}
            strokeWidth={2}
            fillOpacity={1}
            dot={false}
            activeDot={false}
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
            activeDot={false}
          />

          <CartesianGrid fill="var(--background-40)" fillOpacity={0.1} stroke="transparent" />

          {cycles?.map((c, i) => {
            if (i % 2 === 0) return null

            return (
              <ReferenceArea
                key={`shade-${i}`}
                x1={c.start.getTime()}
                x2={c.end.getTime()}
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
                offset: 5,
                fill: 'white',
                fontSize: 12,
                fontFamily: 'var(--font-rootstock-sans)',
                style: { mixBlendMode: 'exclusion', marginBottom: 10 },
              }}
            />
          ))}

          <Tooltip
            content={<ChartTooltipContent />}
            wrapperStyle={{ outline: 'none' }}
            offset={25}
            cursor={
              <CustomCursor backingMaxDomain={backingMaxDomain} rewardsMaxDomain={rewardsMaxDomain[1]} />
            }
            trigger="hover"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
