"use client"

import React, { useMemo } from "react"
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts"
import { generateFundingHistory } from "@/lib/fundingEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE, CHART_LABEL } from "@/lib/constants"

interface FundingChartProps {
  basePrice: number
  hours: number
  longBias: number
  volatility: number
  totalOI: number
  mode: "funding" | "oi" | "cumulative"
}

function FundingChart({ basePrice, hours, longBias, volatility, totalOI, mode }: FundingChartProps) {
  const data = useMemo(
    () => generateFundingHistory(basePrice, hours, longBias, volatility, totalOI),
    [basePrice, hours, longBias, volatility, totalOI],
  )

  if (mode === "oi") {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis
              dataKey="hour"
              stroke={CHART_AXIS}
              tick={CHART_TICK}
              label={{ value: "Hours", position: "bottom", offset: 5, ...CHART_LABEL }}
              tickFormatter={(v: number) => `${v}h`}
            />
            <YAxis
              stroke={CHART_AXIS}
              tick={CHART_TICK}
              label={{ value: "Open Interest ($)", angle: -90, position: "insideLeft", offset: 10, ...CHART_LABEL }}
              tickFormatter={(v: number) => v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={((value: number, name: string) => {
                const label = name === "longOI" ? "Long OI" : "Short OI"
                return [`$${Number(value).toLocaleString()}`, label]
              }) as never}
              labelFormatter={((v: number) => `Hour ${v}`) as never}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#6b8a99" }}
              formatter={(value: string) => value === "longOI" ? "Long OI" : "Short OI"}
            />
            <Bar dataKey="longOI" fill="#14b8a6" fillOpacity={0.6} stackId="oi" />
            <Bar dataKey="shortOI" fill="#f43f5e" fillOpacity={0.6} stackId="oi" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  if (mode === "cumulative") {
    return (
      <div className="w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
            <XAxis
              dataKey="hour"
              stroke={CHART_AXIS}
              tick={CHART_TICK}
              label={{ value: "Hours", position: "bottom", offset: 5, ...CHART_LABEL }}
              tickFormatter={(v: number) => `${v}h`}
            />
            <YAxis
              stroke={CHART_AXIS}
              tick={CHART_TICK}
              label={{ value: "Cumulative ($)", angle: -90, position: "insideLeft", offset: 10, ...CHART_LABEL }}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `$${v.toFixed(0)}`}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={((value: number, name: string) => {
                const label = name === "cumulativeLongCost" ? "Long Cost" : "Short Earnings"
                return [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, label]
              }) as never}
              labelFormatter={((v: number) => `Hour ${v}`) as never}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, color: "#6b8a99" }}
              formatter={(value: string) => value === "cumulativeLongCost" ? "Long Cumulative Cost" : "Short Cumulative Earnings"}
            />
            <ReferenceLine y={0} stroke={CHART_AXIS} />
            <Line type="monotone" dataKey="cumulativeLongCost" stroke="#f43f5e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="cumulativeShortEarnings" stroke="#14b8a6" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    )
  }

  // Default: funding rate chart
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="fundingPosGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="fundingNegGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="hour"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Hours", position: "bottom", offset: 5, ...CHART_LABEL }}
            tickFormatter={(v: number) => `${v}h`}
          />
          <YAxis
            yAxisId="rate"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Funding Rate (%)", angle: -90, position: "insideLeft", offset: 10, ...CHART_LABEL }}
            tickFormatter={(v: number) => `${v.toFixed(3)}%`}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Price ($)", angle: 90, position: "insideRight", offset: 10, ...CHART_LABEL }}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              if (name === "fundingRate") return [`${Number(value).toFixed(4)}%`, "Funding Rate"]
              if (name === "markPrice") return [`$${Number(value).toFixed(2)}`, "Mark Price"]
              return [`$${Number(value).toFixed(2)}`, "Index Price"]
            }) as never}
            labelFormatter={((v: number) => `Hour ${v}`) as never}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#6b8a99" }}
            formatter={(value: string) =>
              value === "fundingRate" ? "Funding Rate" :
              value === "markPrice" ? "Mark Price" : "Index Price"
            }
          />
          <ReferenceLine yAxisId="rate" y={0} stroke={CHART_AXIS} />
          <Bar
            yAxisId="rate"
            dataKey="fundingRate"
            fill="#14b8a6"
            fillOpacity={0.7}
          />
          <Line yAxisId="price" type="monotone" dataKey="markPrice" stroke="#22d3ee" strokeWidth={1.5} dot={false} />
          <Line yAxisId="price" type="monotone" dataKey="indexPrice" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(FundingChart)
