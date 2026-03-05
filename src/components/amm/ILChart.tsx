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

interface ILChartProps {
  currentPriceChange: number
  currentIL: number
}

export default function ILChart({ currentPriceChange, currentIL }: ILChartProps) {
  const data = useMemo(() => generateILCurve(), [])

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
          <defs>
            <linearGradient id="ilGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="priceChange"
            stroke="#475569"
            fontSize={11}
            label={{
              value: "Price Change %",
              position: "bottom",
              offset: 5,
              fill: "#64748b",
              fontSize: 11,
            }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <YAxis
            stroke="#475569"
            fontSize={11}
            label={{
              value: "Impermanent Loss %",
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fill: "#64748b",
              fontSize: 11,
            }}
            tickFormatter={(v: number) => `${v.toFixed(1)}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#0f172a",
              border: "1px solid #1e293b",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${Number(value).toFixed(3)}%`, "IL"]}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            labelFormatter={(v: any) => `Price Change: ${v}%`}
          />
          <Area
            type="monotone"
            dataKey="il"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#ilGradient)"
            isAnimationActive={false}
          />
          <ReferenceLine x={0} stroke="#475569" strokeDasharray="3 3" />
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
