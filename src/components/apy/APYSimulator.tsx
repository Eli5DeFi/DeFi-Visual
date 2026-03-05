"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { calculateApySummary, COMPOUND_FREQUENCIES } from "@/lib/apyEngine"
import GrowthChart from "./GrowthChart"
import APYConceptExplainer from "./APYConceptExplainer"

export default function APYSimulator() {
  const [principal, setPrincipal] = useState(10000)
  const [aprPercent, setAprPercent] = useState(12)
  const [compoundIdx, setCompoundIdx] = useState(4) // Daily
  const [days, setDays] = useState(365)

  const compoundsPerYear = COMPOUND_FREQUENCIES[compoundIdx].value
  const compoundLabel = COMPOUND_FREQUENCIES[compoundIdx].label

  const summary = useMemo(
    () => calculateApySummary(principal, aprPercent, compoundsPerYear, days),
    [principal, aprPercent, compoundsPerYear, days],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Chart & Visualizations */}
      <div className="lg:col-span-2 space-y-6">
        {/* Growth Visualization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              APY vs APR Growth Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="chart">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="chart">Growth Chart</TabsTrigger>
                <TabsTrigger value="breakdown">Yield Breakdown</TabsTrigger>
              </TabsList>
              <TabsContent value="chart">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[350px]"
                >
                  <GrowthChart
                    principal={principal}
                    aprPercent={aprPercent}
                    compoundsPerYear={compoundsPerYear}
                    days={days}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="breakdown">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <YieldBreakdown
                    principal={principal}
                    aprPercent={aprPercent}
                    compoundsPerYear={compoundsPerYear}
                    days={days}
                    summary={summary}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Visual comparison cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="APR (Simple)"
            value={`${summary.apr.toFixed(2)}%`}
            color="text-amber-400"
          />
          <StatCard
            label="APY (Compounded)"
            value={`${summary.apy.toFixed(2)}%`}
            color="text-teal-400"
          />
          <StatCard
            label="Total Earnings"
            value={`$${summary.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="text-emerald-400"
          />
          <StatCard
            label="Compound Bonus"
            value={`+$${summary.compoundBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            color="text-cyan-400"
          />
        </div>
      </div>

      {/* Right column: Controls & Education */}
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">APY Calculator</h3>

              {/* Principal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Initial Investment</span>
                  <span className="font-mono text-white text-lg">
                    ${principal.toLocaleString()}
                  </span>
                </div>
                <Slider
                  value={[principal]}
                  max={100000}
                  min={100}
                  step={100}
                  onValueChange={(val) => setPrincipal(val[0])}
                />
                <div className="flex gap-2">
                  {[1000, 5000, 10000, 50000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setPrincipal(v)}
                      aria-label={`Set principal to $${v.toLocaleString()}`}
                      className="qbtn"
                    >
                      {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* APR */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">APR (Base Rate)</span>
                  <span className="font-mono text-white text-lg">{aprPercent}%</span>
                </div>
                <Slider
                  value={[aprPercent]}
                  max={200}
                  min={1}
                  step={1}
                  onValueChange={(val) => setAprPercent(val[0])}
                />
                <div className="flex gap-2">
                  {[5, 12, 50, 100].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAprPercent(v)}
                      aria-label={`Set APR to ${v}%`}
                      className="qbtn"
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Compounding frequency */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Compound Frequency</span>
                  <span className="font-mono text-white text-sm">{compoundLabel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {COMPOUND_FREQUENCIES.map((freq, idx) => (
                    <button
                      key={freq.label}
                      onClick={() => setCompoundIdx(idx)}
                      className={`text-xs py-2 rounded-md transition-colors border ${
                        compoundIdx === idx
                          ? "bg-teal-600/20 border-teal-500/40 text-teal-400"
                          : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30] hover:text-[#d1fae5]"
                      }`}
                    >
                      {freq.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time period */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Time Period</span>
                  <span className="font-mono text-white text-lg">
                    {days >= 365 ? `${(days / 365).toFixed(days % 365 === 0 ? 0 : 1)} year${days >= 730 ? "s" : ""}` : `${days} days`}
                  </span>
                </div>
                <Slider
                  value={[days]}
                  max={1825}
                  min={30}
                  step={30}
                  onValueChange={(val) => setDays(val[0])}
                />
                <div className="flex gap-2">
                  {[90, 365, 730, 1825].map((v) => (
                    <button
                      key={v}
                      onClick={() => setDays(v)}
                      aria-label={`Set period to ${v >= 365 ? `${v / 365} year${v >= 730 ? "s" : ""}` : `${v} days`}`}
                      className="qbtn"
                    >
                      {v >= 365 ? `${v / 365}y` : `${v}d`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary box */}
              <motion.div
                className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
                initial={false}
                animate={{
                  borderColor: summary.compoundBonus > 100 ? "#14b8a6" : "#132d30",
                }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Daily Rate</span>
                  <span className="text-white font-mono">{summary.dailyRate.toFixed(4)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Effective APY</span>
                  <span className="text-teal-400 font-mono">{summary.apy.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Final Value</span>
                  <span className="text-white font-mono">
                    ${(principal + summary.totalEarnings).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Multiplier</span>
                  <span className="text-emerald-400 font-mono">{summary.effectiveMultiplier.toFixed(4)}x</span>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Concept Explainer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              Understanding Yield
            </CardTitle>
          </CardHeader>
          <CardContent>
            <APYConceptExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div
      className="glass-card rounded-xl p-4 text-center"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className={`text-lg sm:text-xl font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-[#6b8a99] mt-1">{label}</div>
    </motion.div>
  )
}

/* ── Yield Breakdown ── */
function YieldBreakdown({
  principal,
  aprPercent,
  compoundsPerYear,
  days,
  summary,
}: {
  principal: number
  aprPercent: number
  compoundsPerYear: number
  days: number
  summary: ReturnType<typeof import("@/lib/apyEngine").calculateApySummary>
}) {
  const simpleEarnings = principal * (aprPercent / 100) * (days / 365)
  const finalCompounded = principal + summary.totalEarnings
  const finalSimple = principal + simpleEarnings

  const steps = [
    {
      label: "Initial Investment",
      color: "text-[#6b8a99]",
      bg: "bg-[#0f1d24]/50",
      items: [
        ["Principal", `$${principal.toLocaleString()}`],
        ["Base APR", `${aprPercent}%`],
        ["Compounding", `${compoundsPerYear >= 2_628_000 ? "Per Block" : compoundsPerYear + "x/year"}`],
        ["Duration", `${days} days`],
      ],
    },
    {
      label: "Simple Interest (APR)",
      color: "text-amber-400",
      bg: "bg-amber-950/20",
      items: [
        ["Earnings", `$${simpleEarnings.toFixed(2)}`],
        ["Final Value", `$${finalSimple.toFixed(2)}`],
        ["Effective Rate", `${aprPercent.toFixed(2)}% APR`],
      ],
    },
    {
      label: "Compound Interest (APY)",
      color: "text-teal-400",
      bg: "bg-teal-950/20",
      items: [
        ["Earnings", `$${summary.totalEarnings.toFixed(2)}`],
        ["Final Value", `$${finalCompounded.toFixed(2)}`],
        ["Effective Rate", `${summary.apy.toFixed(2)}% APY`],
      ],
    },
    {
      label: "Compounding Advantage",
      color: "text-cyan-400",
      bg: "bg-cyan-950/20",
      items: [
        ["Extra from Compounding", `+$${summary.compoundBonus.toFixed(2)}`],
        ["APY - APR Spread", `+${(summary.apy - aprPercent).toFixed(2)}%`],
        ["Multiplier", `${summary.effectiveMultiplier.toFixed(4)}x`],
      ],
    },
  ]

  return (
    <div className="space-y-3 py-2">
      {steps.map((step, i) => (
        <div key={i} className={`${step.bg} border border-[#132d30] rounded-lg p-3`}>
          <h4 className={`text-sm font-semibold ${step.color} mb-2`}>{step.label}</h4>
          <div className="space-y-1">
            {step.items.map(([label, value], j) => (
              <div key={j} className="flex justify-between text-xs">
                <span className="text-[#6b8a99]">{label}</span>
                <span className="text-white font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
