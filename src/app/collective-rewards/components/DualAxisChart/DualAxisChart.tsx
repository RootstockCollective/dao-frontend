'use client'

import React, { useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts'

/**
 * TYPES
 */
export type BackingPoint = {
  day: Date | number | string // ISO string or timestamp OK
  backing: number | bigint
}

export type RewardsPoint = {
  day: Date | number | string
  rewards: {
    rif: number | bigint
    rbtc: number | bigint
    usd?: number // optional if you prefer to provide only rif/rbtc
  }
}

export type CycleWindow = {
  label: string // e.g. "cycle 22"
  start: Date | number | string // inclusive
  end: Date | number | string // exclusive (recommended)
  shade?: boolean // if true, lightly shade background for the range
}

export type DualAxisRewardsBackingChartProps = {
  backingSeries: BackingPoint[]
  rewardsSeries: RewardsPoint[] // We'll plot rewards on the right axis
  colors?: {
    backing?: string // e.g. "#3C4BFF"
    rewards?: string
    grid?: string
    backdropShade?: string // translucent for cycle shading
  }
  cycles?: CycleWindow[] // optional cycle annotations
  yLeftLabel?: string // default: "BACKING"
  yRightLabel?: string // default: "REWARDS"
  height?: number // default: 360
  /**
   * If true, stack rif + rbtc on right axis (StackedAreaChart). If false, uses only USD (if present) as a single area.
   */
  stackRewards?: boolean
}

/**
 * HELPERS
 */
const toDate = (d: Date | number | string): Date => (d instanceof Date ? d : new Date(d))

const toTs = (d: Date | number | string): number => toDate(d).getTime()

const formatShort = (n: number) => {
  const abs = Math.abs(n)
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} B`
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} M`
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)} K`
  return `${n.toLocaleString()}`
}

const bigToNum = (v: number | bigint | undefined): number =>
  typeof v === 'bigint' ? Number(v) : Number(v ?? 0)

/**
 * Merge series by day (inner join on day). If a day exists only on one series,
 * we still include it with the value from that series and 0 for the missing one.
 */
function useMergedSeries(backing: BackingPoint[], rewards: RewardsPoint[]) {
  return useMemo(() => {
    const map = new Map<
      string,
      { day: Date; backing?: number; rewardsUSD?: number; rewardsRif?: number; rewardsRbtc?: number }
    >()

    for (const b of backing) {
      const date = toDate(b.day)
      const key = date.toISOString().slice(0, 10) // group by day
      const entry = map.get(key) ?? ({ day: new Date(key) } as any)
      entry.backing = bigToNum(b.backing)
      map.set(key, entry)
    }

    for (const r of rewards) {
      const date = toDate(r.day)
      const key = date.toISOString().slice(0, 10)
      const entry = map.get(key) ?? ({ day: new Date(key) } as any)
      entry.rewardsUSD = Number((r.rewards as any).usd ?? 0)
      entry.rewardsRif = bigToNum(r.rewards.rif)
      entry.rewardsRbtc = bigToNum(r.rewards.rbtc)
      map.set(key, entry)
    }

    return Array.from(map.values()).sort((a, b) => a.day.getTime() - b.day.getTime())
  }, [backing, rewards])
}

/**
 * CUSTOM TOOLTIP (supports stacked rewards)
 */
const TooltipContent = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]?.payload?.day as Date
  const backingVal = payload.find((p: any) => p.dataKey === 'backing')?.value ?? 0
  const rewardsUSD = payload.find((p: any) => p.dataKey === 'rewardsUSD')?.value ?? 0
  const rewardsRif = payload.find((p: any) => p.dataKey === 'rewardsRif')?.value ?? 0
  const rewardsRbtc = payload.find((p: any) => p.dataKey === 'rewardsRbtc')?.value ?? 0

  return (
    <div className="rounded-2xl bg-neutral-900/90 text-white backdrop-blur px-4 py-3 shadow-xl border border-white/10">
      <div className="text-xs opacity-80">{d instanceof Date ? d.toLocaleDateString() : String(label)}</div>
      <div className="mt-1 space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: payload.find((p: any) => p.dataKey === 'backing')?.color }}
          />
          <span className="text-xs opacity-70">Backing</span>
          <span className="ml-auto font-medium">{formatShort(Number(backingVal))}</span>
        </div>
        {rewardsUSD ? (
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: payload.find((p: any) => p.dataKey === 'rewardsUSD')?.color }}
            />
            <span className="text-xs opacity-70">Rewards (USD)</span>
            <span className="ml-auto font-medium">{formatShort(Number(rewardsUSD))}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: payload.find((p: any) => p.dataKey === 'rewardsRif')?.color }}
              />
              <span className="text-xs opacity-70">Rewards (RIF)</span>
              <span className="ml-auto font-medium">{formatShort(Number(rewardsRif))}</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: payload.find((p: any) => p.dataKey === 'rewardsRbtc')?.color }}
              />
              <span className="text-xs opacity-70">Rewards (RBTC)</span>
              <span className="ml-auto font-medium">{formatShort(Number(rewardsRbtc))}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/**
 * MAIN COMPONENT (now supports stacked area on right axis)
 */
export function DualAxisRewardsBackingChart({
  backingSeries,
  rewardsSeries,
  colors = {
    backing: '#4B5CF0',
    rewards: '#DEFF1A',
    grid: 'rgba(255,255,255,0.08)',
    backdropShade: 'rgba(227,255,0,0.08)',
  },
  cycles = [],
  yLeftLabel = 'BACKING',
  yRightLabel = 'REWARDS',
  height = 400,
}: DualAxisRewardsBackingChartProps) {
  const data = useMergedSeries(backingSeries, rewardsSeries)

  const xDomain = useMemo<[number, number] | undefined>(() => {
    if (!data.length) return undefined;
    const first = data[0].day instanceof Date ? data[0].day.getTime() : +new Date(data[0].day);
    const last  = data[data.length - 1].day instanceof Date ? data[data.length - 1].day.getTime() : +new Date(data[data.length - 1].day);
    return [first, last];
  }, [data]);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: 8, right: 8, top: 60, bottom: 0 }} stackOffset="none">
          <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />

          {/* CYCLE SHADING */}
          {cycles?.map((c, i) => {
            if (!c.shade) return null
            return (
              <ReferenceArea
                key={`shade-${i}`}
                x1={toTs(c.start)}
                x2={toTs(c.end)}
                y1={0}
                y2={'auto'}
                fill={colors.backdropShade}
                ifOverflow="extendDomain"
              />
            )
          })}

          {/* CYCLE LINES */}
          {cycles?.map((c, i) => (
            <ReferenceLine
              key={`line-${i}`}
              x={toTs(c.start)}
              stroke={colors.grid}
              strokeDasharray="4 4"
              label={{ value: c.label, position: 'insideTopRight', offset: 10, fill: '#A1A1AA' }}
            />
          ))}

          <XAxis
            dataKey={(p: any) => (p.day instanceof Date ? p.day.getTime() : p.day)}
            type="number"
            domain={xDomain ?? ['auto', 'auto']}
            tickFormatter={v => new Date(v).toLocaleString(undefined, { month: 'short' })}
            tickMargin={8}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            yAxisId="left"
            orientation="left"
            tickFormatter={formatShort}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#7C89F5" }}
            label={{
              value: yLeftLabel,
              angle: 0,
              position: 'top',
              offset: 40,
              fill: "#7C89F5",
            }}
            domain={[0, 'auto']}
            className='font-rootstock-sans text-xs'
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
            }}
            domain={[0, 'auto']}
            className='font-rootstock-sans text-xs'
          />

          <Tooltip content={<TooltipContent />} wrapperStyle={{ outline: 'none' }} />

          <Area
            type="natural"
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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function DemoDualAxisChart() {
  const start = new Date('2024-03-01').getTime()
  const days = 490 // ~ Mar 2024 -> Jul 2025

  // cycles to annotate (optional shading as you already have)
  const cycles: CycleWindow[] = [
    { label: 'cycle 21', start: '2024-03-01', end: '2025-01-15', shade: true },
    { label: 'cycle 22', start: '2025-01-15', end: '2025-06-15', shade: true },
    { label: 'cycle 23', start: '2025-06-15', end: '2025-07-31', shade: false },
  ]

  // --- BACKING: smooth monotonic increase ~350M -> ~780M
  const backingStart = 350_000_000
  const backingEnd = 780_000_000

  const backingSeries: BackingPoint[] = []
  let prevBacking = backingStart

  for (let i = 0; i < days; i++) {
    const day = new Date(start + i * 24 * 3600 * 1000)
    const t = i / (days - 1) // 0..1

    // ease-in-out-ish curve + tiny wobble
    const curve = backingStart + (backingEnd - backingStart) * (0.5 - 0.5 * Math.cos(Math.PI * t))
    const wobble = Math.sin(i / 28) * 2_000_000

    const candidate = Math.round(curve + wobble)

    // ensure strictly non-decreasing
    const backing = Math.max(candidate, prevBacking + 50_000)
    prevBacking = backing

    backingSeries.push({ day, backing })
  }

  // --- REWARDS: step/plateau per cycle with light wobble ~120K -> ~500K
  const rewardsSeries: RewardsPoint[] = backingSeries.map(({ day, backing }, i) => {
    const ts = (day as Date).getTime();
    const inC21 = ts < new Date('2025-01-15').getTime();
    const inC22 = ts >= new Date('2025-01-15').getTime() && ts < new Date('2025-06-15').getTime();
  
    const base =
      inC21 ? 160_000 :
      inC22 ? 260_000 :
              360_000;
  
    const drift  = inC21 ? i * 120 : inC22 ? (i - 320) * 220 : (i - 450) * 240;
    const wobble = Math.sin(i / 20) * 12_000;
    let usd = Math.max(120_000, Math.round(base + drift * 0.25 + wobble));
  
    // 🔒 cap rewards at a fraction of backing (keeps rewards < backing at all times)
    const backingNum = Number(backing);
    const cap = Math.floor(backingNum * 0.00055); // ~0.055% of backing (tune to taste)
    usd = Math.min(usd, cap);
  
    return { day, rewards: { rif: 0, rbtc: 0, usd } };
  });

  return (
    <div className="p-6 pt-10 text-white rounded-2xl">
      <DualAxisRewardsBackingChart
        backingSeries={backingSeries}
        rewardsSeries={rewardsSeries}
        cycles={cycles}
        colors={{
          backing: '#4B5CF0',
          rewards: '#DEFF1A',
          grid: 'rgba(255,255,255,0.10)',
          backdropShade: 'rgba(227,255,0,0.06)',
        }}
        yLeftLabel="BACKING"
        yRightLabel="REWARDS"
        height={420}
      />
    </div>
  )
}
