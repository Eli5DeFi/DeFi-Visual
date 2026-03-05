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
  ReferenceLine,
  ReferenceDot,
} from "recharts"
import { generateILCurve } from "@/lib/mathEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE, CHART_LABEL } from "@/lib/constants"

interface ILChartProps {
  currentPriceChange: number
  currentIL: number
}

function ILChart({ currentPriceChange, currentIL }: ILChartProps) {
  const data = useMemo(() => generateILCurve(), [])

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="ilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="priceChange"
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{
              value: "Price Change %",
              position: "bottom",
              offset: 5,
              ...CHART_LABEL,
            }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{
              value: "Impermanent Loss %",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              ...CHART_LABEL,
            }}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value: number, name: string) => [`${Number(value).toFixed(3)}%`, "IL"]) as never}
            labelFormatter={((v: number) => `Price Change: ${v}%`) as never}
          />
          <Area
            type="monotone"
            dataKey="il"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#ilGradient)"
            isAnimationActive={false}
          />
          <ReferenceLine x={0} stroke="#3b6b6b" strokeDasharray="3 3" />
          {Math.abs(currentPriceChange) > 0.1 && (
            <ReferenceDot
              x={Math.round(currentPriceChange / 5) * 5}
              y={Math.abs(currentIL)}
              r={6}
              fill="#f59e0b"
              stroke="#f59e0b"
              strokeWidth={2}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(ILChart)
