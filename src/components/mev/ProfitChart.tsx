"use client"

import React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE, CHART_LABEL, THEME } from "@/lib/constants"

interface ProfitChartProps {
  data: Array<{ capital: number; profit: number }>
  currentCapital: number
  optimalCapital: number
}

function ProfitChartInner({ data, currentCapital, optimalCapital }: ProfitChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={CHART_MARGIN}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
        <XAxis
          dataKey="capital"
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          label={{ value: "Attacker Capital (USDC)", position: "insideBottom", offset: -5, ...CHART_LABEL }}
        />
        <YAxis
          stroke={CHART_AXIS}
          tick={CHART_TICK}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          label={{ value: "Profit (USDC)", angle: -90, position: "insideLeft", offset: 5, ...CHART_LABEL }}
        />
        <Tooltip
          contentStyle={CHART_TOOLTIP_STYLE}
          formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Profit"]}
          labelFormatter={(label) => `Capital: $${Number(label).toLocaleString()}`}
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke={THEME.primary}
          fill="url(#profitGrad)"
          strokeWidth={2}
        />
        <ReferenceLine
          x={currentCapital}
          stroke={THEME.cyan}
          strokeDasharray="4 4"
          label={{ value: "Current", fill: "#22d3ee", fontSize: 10, position: "top" }}
        />
        <ReferenceLine
          x={optimalCapital}
          stroke={THEME.accent}
          strokeDasharray="4 4"
          label={{ value: "Optimal", fill: "#f59e0b", fontSize: 10, position: "top" }}
        />
        <ReferenceLine y={0} stroke={CHART_AXIS} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export default React.memo(ProfitChartInner)
