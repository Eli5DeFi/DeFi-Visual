"use client"

import React, { useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  generateStableSwapCurve,
  generateConstantProductCurve,
  generateConstantSumCurve,
} from "@/lib/stableSwapEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE, CHART_LABEL } from "@/lib/constants"

const A_VALUES = [1, 5, 10, 50, 100, 500]
const COLORS = ["#f43f5e", "#fb923c", "#f59e0b", "#22d3ee", "#14b8a6", "#a855f7"]

interface MultiACurveChartProps {
  D: number
  currentA: number
}

function MultiACurveChart({ D, currentA }: MultiACurveChartProps) {
  const mergedData = useMemo(() => {
    const curves = A_VALUES.map((a) => generateStableSwapCurve(a, D, 200))
    const cpCurve = generateConstantProductCurve(D, 200)
    const csCurve = generateConstantSumCurve(D, 200)

    // Use StableSwap A=1 curve x values as the base
    const map = new Map<number, Record<string, number>>()

    // Add constant sum
    for (const pt of csCurve) {
      const key = Math.round(pt.x * 10) / 10
      const existing = map.get(key) || { x: key }
      existing.cs = Math.round(pt.y * 100) / 100
      map.set(key, existing)
    }

    // Add constant product
    for (const pt of cpCurve) {
      const key = Math.round(pt.x * 10) / 10
      const existing = map.get(key) || { x: key }
      existing.cp = Math.round(pt.y * 100) / 100
      map.set(key, existing)
    }

    // Add StableSwap curves
    for (let ai = 0; ai < A_VALUES.length; ai++) {
      for (const pt of curves[ai]) {
        const key = Math.round(pt.x * 10) / 10
        const existing = map.get(key) || { x: key }
        existing[`a${A_VALUES[ai]}`] = Math.round(pt.y * 100) / 100
        map.set(key, existing)
      }
    }

    return Array.from(map.values()).sort((a, b) => a.x - b.x)
  }, [D])

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mergedData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, "auto"]}
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Token X", position: "bottom", offset: 5, ...CHART_LABEL }}
            tickFormatter={(v: number) =>
              v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
            }
          />
          <YAxis
            type="number"
            domain={[0, "auto"]}
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Token Y", angle: -90, position: "insideLeft", offset: 10, ...CHART_LABEL }}
            tickFormatter={(v: number) =>
              v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
            }
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              if (name === "cs") return [Number(value).toFixed(2), "x+y=D"]
              if (name === "cp") return [Number(value).toFixed(2), "xy=k"]
              const aVal = name.replace("a", "")
              return [Number(value).toFixed(2), `A=${aVal}${Number(aVal) === currentA ? " (current)" : ""}`]
            }) as never}
            labelFormatter={((v: number) => `X: ${Number(v).toFixed(2)}`) as never}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, color: "#6b8a99" }}
            formatter={(value: string) => {
              if (value === "cs") return "x+y=D"
              if (value === "cp") return "xy=k"
              const aVal = value.replace("a", "")
              return `A=${aVal}${Number(aVal) === currentA ? " ●" : ""}`
            }}
          />

          {/* Constant sum */}
          <Line type="monotone" dataKey="cs" stroke="#6b8a99" strokeWidth={1} strokeDasharray="8 4" dot={false} isAnimationActive={false} connectNulls />

          {/* Constant product */}
          <Line type="monotone" dataKey="cp" stroke="#6b8a99" strokeWidth={1} strokeDasharray="4 4" dot={false} isAnimationActive={false} connectNulls />

          {/* StableSwap curves for each A */}
          {A_VALUES.map((a, i) => (
            <Line
              key={a}
              type="monotone"
              dataKey={`a${a}`}
              stroke={COLORS[i]}
              strokeWidth={a === currentA ? 3 : 1.5}
              strokeOpacity={a === currentA ? 1 : 0.6}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(MultiACurveChart)
