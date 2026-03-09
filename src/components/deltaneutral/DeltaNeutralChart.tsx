"use client"

import React, { useMemo } from "react"
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  AreaChart,
  BarChart,
  Bar,
} from "recharts"
import {
  CHART_MARGIN,
  CHART_GRID,
  CHART_TICK,
  CHART_TOOLTIP_STYLE,
  THEME,
} from "@/lib/constants"
import { simulateDeltaNeutral, type DNSnapshot } from "@/lib/deltaNeutralEngine"

interface Props {
  initialPrice: number
  positionSize: number
  fundingRate8h: number
  days: number
  volatility: number
  leverage: number
  mode: "value" | "funding" | "delta"
}

export default function DeltaNeutralChart({
  initialPrice,
  positionSize,
  fundingRate8h,
  days,
  volatility,
  leverage,
  mode,
}: Props) {
  const data = useMemo(
    () => simulateDeltaNeutral(initialPrice, positionSize, fundingRate8h, days, volatility, leverage),
    [initialPrice, positionSize, fundingRate8h, days, volatility, leverage],
  )

  if (mode === "value") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="dnTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dnFunding" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis dataKey="day" tick={CHART_TICK} label={{ value: "Day", ...{ fill: "#6b8a99", fontSize: 11 }, position: "insideBottomRight", offset: -5 }} />
          <YAxis tick={CHART_TICK} domain={["auto", "auto"]} tickFormatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`]} />
          <ReferenceLine y={positionSize} stroke={THEME.mutedFg} strokeDasharray="5 5" label={{ value: "Initial", fill: THEME.mutedFg, fontSize: 10 }} />
          <Area type="monotone" dataKey="totalValue" name="Total Value" stroke={THEME.primary} fill="url(#dnTotal)" strokeWidth={2} />
          <Area type="monotone" dataKey="fundingIncome" name="Funding Income" stroke={THEME.accent} fill="url(#dnFunding)" strokeWidth={1.5} />
          <Line type="monotone" dataKey="netPositionValue" name="Position Value" stroke={THEME.cyan} strokeWidth={1.5} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  if (mode === "funding") {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="dnYield" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis dataKey="day" tick={CHART_TICK} />
          <YAxis tick={CHART_TICK} tickFormatter={(v: number) => `${v.toFixed(1)}%`} />
          <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v) => [`${Number(v ?? 0).toFixed(3)}%`]} />
          <ReferenceLine y={0} stroke={THEME.mutedFg} />
          <Area type="monotone" dataKey="yieldPct" name="Cumulative Yield" stroke={THEME.success} fill="url(#dnYield)" strokeWidth={2} />
          <Line type="monotone" dataKey="annualizedYield" name="Annualized APY" stroke={THEME.accent} strokeWidth={1.5} dot={false} strokeDasharray="5 3" />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  // delta mode
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={CHART_MARGIN}>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis dataKey="day" tick={CHART_TICK} />
        <YAxis yAxisId="price" tick={CHART_TICK} tickFormatter={(v: number) => `$${v.toLocaleString()}`} />
        <YAxis yAxisId="delta" orientation="right" tick={CHART_TICK} tickFormatter={(v: number) => v.toFixed(4)} />
        <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
        <ReferenceLine yAxisId="delta" y={0} stroke={THEME.mutedFg} strokeDasharray="5 5" label={{ value: "Zero Delta", fill: THEME.mutedFg, fontSize: 10 }} />
        <Line yAxisId="price" type="monotone" dataKey="ethPrice" name="ETH Price" stroke={THEME.cyan} strokeWidth={2} dot={false} />
        <Bar yAxisId="delta" dataKey="delta" name="Net Delta" fill={THEME.primary} opacity={0.6} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
