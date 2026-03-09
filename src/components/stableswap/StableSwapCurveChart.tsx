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
  ReferenceDot,
} from "recharts"
import {
  generateStableSwapCurve,
  generateConstantProductCurve,
  generateConstantSumCurve,
} from "@/lib/stableSwapEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE, CHART_LABEL } from "@/lib/constants"

interface StableSwapCurveChartProps {
  A: number
  D: number
  currentX: number
  currentY: number
  showConstantProduct: boolean
  showConstantSum: boolean
}

function StableSwapCurveChart({
  A,
  D,
  currentX,
  currentY,
  showConstantProduct,
  showConstantSum,
}: StableSwapCurveChartProps) {
  const stableSwapData = useMemo(() => generateStableSwapCurve(A, D, 300), [A, D])
  const cpData = useMemo(() => generateConstantProductCurve(D, 300), [D])
  const csData = useMemo(() => generateConstantSumCurve(D, 200), [D])

  // Merge all curves into a single dataset keyed by x
  const mergedData = useMemo(() => {
    const map = new Map<number, { x: number; ss?: number; cp?: number; cs?: number }>()

    for (const pt of stableSwapData) {
      const key = Math.round(pt.x * 100) / 100
      const existing = map.get(key) || { x: key }
      existing.ss = Math.round(pt.y * 100) / 100
      map.set(key, existing)
    }

    if (showConstantProduct) {
      for (const pt of cpData) {
        const key = Math.round(pt.x * 100) / 100
        const existing = map.get(key) || { x: key }
        existing.cp = Math.round(pt.y * 100) / 100
        map.set(key, existing)
      }
    }

    if (showConstantSum) {
      for (const pt of csData) {
        const key = Math.round(pt.x * 100) / 100
        const existing = map.get(key) || { x: key }
        existing.cs = Math.round(pt.y * 100) / 100
        map.set(key, existing)
      }
    }

    return Array.from(map.values()).sort((a, b) => a.x - b.x)
  }, [stableSwapData, cpData, csData, showConstantProduct, showConstantSum])

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mergedData} margin={CHART_MARGIN}>
          <defs>
            <linearGradient id="ssGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="x"
            type="number"
            domain={[0, "auto"]}
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Token X Balance", position: "bottom", offset: 5, ...CHART_LABEL }}
            tickFormatter={(v: number) =>
              v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
            }
          />
          <YAxis
            type="number"
            domain={[0, "auto"]}
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{ value: "Token Y Balance", angle: -90, position: "insideLeft", offset: 10, ...CHART_LABEL }}
            tickFormatter={(v: number) =>
              v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
            }
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value: number, name: string) => {
              const label =
                name === "ss" ? `StableSwap (A=${A})` :
                name === "cp" ? "Constant Product (xy=k)" :
                "Constant Sum (x+y=D)"
              return [Number(value).toFixed(2), label]
            }) as never}
            labelFormatter={((v: number) => `X: ${Number(v).toFixed(2)}`) as never}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#6b8a99" }}
            formatter={(value: string) =>
              value === "ss" ? `StableSwap (A=${A})` :
              value === "cp" ? "Constant Product (xy=k)" :
              "Constant Sum (x+y=D)"
            }
          />

          {/* Constant Sum (straight line) */}
          {showConstantSum && (
            <Line
              type="monotone"
              dataKey="cs"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="8 4"
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          )}

          {/* Constant Product (hyperbola) */}
          {showConstantProduct && (
            <Line
              type="monotone"
              dataKey="cp"
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          )}

          {/* StableSwap curve */}
          <Line
            type="monotone"
            dataKey="ss"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
            connectNulls
          />

          {/* Current position dot */}
          <ReferenceDot
            x={Math.round(currentX * 100) / 100}
            y={Math.round(currentY * 100) / 100}
            r={7}
            fill="#22d3ee"
            stroke="#071115"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(StableSwapCurveChart)
