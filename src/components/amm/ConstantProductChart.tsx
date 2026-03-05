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

interface ConstantProductChartProps {
  pool: PoolState
  initialState: PoolState
}

export default function ConstantProductChart({
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
        <LineChart data={mergedData} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="x"
            type="number"
            domain={["auto", "auto"]}
            stroke="#475569"
            fontSize={11}
            label={{
              value: "Token X (ETH)",
              position: "bottom",
              offset: 5,
              fill: "#64748b",
              fontSize: 11,
            }}
            tickFormatter={(v: number) => v.toFixed(1)}
          />
          <YAxis
            stroke="#475569"
            fontSize={11}
            label={{
              value: "Token Y (USDC)",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#64748b",
              fontSize: 11,
            }}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              value != null ? Number(value).toFixed(2) : "0",
              name === "current" ? "Current Curve" : "Initial Curve",
            ]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(v: any) => `ETH: ${Number(v).toFixed(2)}`}
          />
          {/* Initial curve (faded) */}
          <Line
            type="monotone"
            dataKey="initial"
            stroke="#475569"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          {/* Current curve */}
          <Line
            type="monotone"
            dataKey="current"
            stroke="#8b5cf6"
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
            fill="#475569"
            stroke="#475569"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
