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
  ReferenceDot,
} from "recharts"
import { getConstantProductCurve, PoolState } from "@/lib/mathEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE } from "@/lib/constants"

interface ConstantProductChartProps {
  pool: PoolState
  initialState: PoolState
}

function ConstantProductChart({
  pool,
  initialState,
}: ConstantProductChartProps) {
  const curveData = useMemo(
    () => getConstantProductCurve(pool.k, pool.tokenX),
    [pool.k, pool.tokenX]
  )

  const initialCurve = useMemo(
    () => getConstantProductCurve(initialState.k, initialState.tokenX),
    [initialState.k, initialState.tokenX]
  )

  const mergedData = useMemo(() => {
    return curveData.map((pt, i) => ({
      x: pt.x,
      current: pt.y,
      initial: initialCurve[i]?.y ?? null,
    }))
  }, [curveData, initialCurve])

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mergedData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{
              value: "Token X (ETH)",
              position: "bottom",
              offset: 5,
              fill: "#6b8a99",
              fontSize: 11,
            }}
            tickFormatter={(v: number) => v.toFixed(1)}
          />
          <YAxis
            stroke={CHART_AXIS}
            tick={CHART_TICK}
            label={{
              value: "Token Y (USDC)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#6b8a99",
              fontSize: 11,
            }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
            }
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={((value: number | undefined, name: string | undefined) => [
              value != null ? Number(value).toFixed(2) : "0",
              name === "current" ? "Current Curve" : "Initial Curve",
            ]) as never}
            labelFormatter={((v: number) => `ETH: ${Number(v).toFixed(2)}`) as never}
          />
          {/* Initial curve (faded) */}
          <Line
            type="monotone"
            dataKey="initial"
            stroke="#3b6b6b"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          {/* Current curve */}
          <Line
            type="monotone"
            dataKey="current"
            stroke="#14b8a6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={500}
          />
          {/* Current position dot */}
          <ReferenceDot
            x={pool.tokenX}
            y={pool.tokenY}
            r={6}
            fill="#f59e0b"
            stroke="#f59e0b"
            strokeWidth={2}
          />
          {/* Initial position dot */}
          <ReferenceDot
            x={initialState.tokenX}
            y={initialState.tokenY}
            r={4}
            fill="#3b6b6b"
            stroke="#3b6b6b"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default React.memo(ConstantProductChart)
