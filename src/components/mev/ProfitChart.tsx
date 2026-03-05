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

interface ProfitChartProps {
  data: Array<{ capital: number; profit: number }>
  currentCapital: number
  optimalCapital: number
}

export default function ProfitChart({ data, currentCapital, optimalCapital }: ProfitChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis
          dataKey="capital"
          stroke="#475569"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          label={{ value: "Attacker Capital (USDC)", position: "insideBottom", offset: -5, fill: "#64748b", fontSize: 11 }}
        />
        <YAxis
          stroke="#475569"
          tick={{ fill: "#64748b", fontSize: 11 }}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
          label={{ value: "Profit (USDC)", angle: -90, position: "insideLeft", offset: 5, fill: "#64748b", fontSize: 11 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#0f172a",
            border: "1px solid #1e293b",
            borderRadius: "8px",
            color: "#f8fafc",
            fontSize: 12,
          }}
          formatter={(value) => [`$${Number(value ?? 0).toFixed(2)}`, "Profit"]}
          labelFormatter={(label) => `Capital: $${Number(label).toLocaleString()}`}
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke="#22c55e"
          fill="url(#profitGrad)"
          strokeWidth={2}
        />
        <ReferenceLine
          x={currentCapital}
          stroke="#8b5cf6"
          strokeDasharray="4 4"
          label={{ value: "Current", fill: "#8b5cf6", fontSize: 10, position: "top" }}
        />
        <ReferenceLine
          x={optimalCapital}
          stroke="#f59e0b"
          strokeDasharray="4 4"
          label={{ value: "Optimal", fill: "#f59e0b", fontSize: 10, position: "top" }}
        />
        <ReferenceLine y={0} stroke="#475569" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
