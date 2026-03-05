"use client"

import React, { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { generateGrowthCurve } from "@/lib/apyEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE, CHART_LABEL } from "@/lib/constants"

interface GrowthChartProps {
  principal: number
  aprPercent: number
  compoundsPerYear: number
  days: number
}

function GrowthChart({ principal, aprPercent, compoundsPerYear, days }: GrowthChartProps) {
  const data = useMemo(
    () => generateGrowthCurve(principal, aprPercent, compoundsPerYear, days),
    [principal, aprPercent, compoundsPerYear, days],
  )

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="apyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="aprGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="diffGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="day"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Days", position: "bottom", offset: 5, ...CHART_LABEL }}
            tickFormatter={(v: number) =>
              v >= 365 ? `${(v / 365).toFixed(v % 365 === 0 ? 0 : 1)}y` : `${v}d`
            }
          />
          <YAxis
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Value ($)", angle: -90, position: "insideLeft", offset: 10, ...CHART_LABEL }}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1000
                ? `${(v / 1000).toFixed(0)}k`
                : v.toFixed(0)
            }
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              const label =
                name === "compoundedValue" ? "APY (Compounded)" :
                name === "simpleValue" ? "APR (Simple)" : "Compound Bonus"
              return [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label]
            }) as never}
            labelFormatter={((v: number) => `Day ${v}`) as never}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#6b8a99" }}
            formatter={(value: string) =>
              value === "compoundedValue" ? "APY (Compounded)" :
              value === "simpleValue" ? "APR (Simple)" : "Compound Bonus"
            }
          />
          <Area
            type="monotone"
            dataKey="simpleValue"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="6 3"
            fill="url(#aprGrad)"
            isAnimationActive={true}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="compoundedValue"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="url(#apyGrad)"
            isAnimationActive={true}
            animationDuration={600}
          />
          <Area
            type="monotone"
            dataKey="difference"
            stroke="#22d3ee"
            strokeWidth={1.5}
            fill="url(#diffGrad)"
            isAnimationActive={true}
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(GrowthChart)
