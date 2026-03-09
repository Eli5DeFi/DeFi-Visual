"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  simulateDeltaNeutral,
  calculateEthenaMetrics,
  calculateDNRisks,
} from "@/lib/deltaNeutralEngine"
import DeltaNeutralChart from "./DeltaNeutralChart"
import DeltaNeutralConceptExplainer from "./DeltaNeutralConceptExplainer"

export default function DeltaNeutralSimulator() {
  const [ethPrice, setEthPrice] = useState(2000)
  const [positionSize, setPositionSize] = useState(100_000)
  const [fundingRate, setFundingRate] = useState(0.01)
  const [days, setDays] = useState(90)
  const [volatility, setVolatility] = useState(5)
  const [leverage, setLeverage] = useState(5)

  // USDe specific
  const [usdeSupply, setUsdeSupply] = useState(5_000_000_000)
  const [reservePct, setReservePct] = useState(10)

  const simulation = useMemo(
    () => simulateDeltaNeutral(ethPrice, positionSize, fundingRate, days, volatility, leverage),
    [ethPrice, positionSize, fundingRate, days, volatility, leverage],
  )

  const latestSnapshot = simulation[simulation.length - 1]

  const ethenaMetrics = useMemo(
    () => calculateEthenaMetrics(usdeSupply, ethPrice, fundingRate, reservePct),
    [usdeSupply, ethPrice, fundingRate, reservePct],
  )

  const risks = useMemo(
    () => calculateDNRisks(positionSize, leverage, fundingRate, ethPrice),
    [positionSize, leverage, fundingRate, ethPrice],
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Charts */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              Delta-Neutral Strategy Simulator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="value">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="value">Portfolio Value</TabsTrigger>
                <TabsTrigger value="funding">Yield / APY</TabsTrigger>
                <TabsTrigger value="delta">Price & Delta</TabsTrigger>
              </TabsList>
              <TabsContent value="value">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[350px]">
                  <DeltaNeutralChart
                    initialPrice={ethPrice}
                    positionSize={positionSize}
                    fundingRate8h={fundingRate}
                    days={days}
                    volatility={volatility}
                    leverage={leverage}
                    mode="value"
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="funding">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[350px]">
                  <DeltaNeutralChart
                    initialPrice={ethPrice}
                    positionSize={positionSize}
                    fundingRate8h={fundingRate}
                    days={days}
                    volatility={volatility}
                    leverage={leverage}
                    mode="funding"
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="delta">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[350px]">
                  <DeltaNeutralChart
                    initialPrice={ethPrice}
                    positionSize={positionSize}
                    fundingRate8h={fundingRate}
                    days={days}
                    volatility={volatility}
                    leverage={leverage}
                    mode="delta"
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Value"
            value={`$${latestSnapshot.totalValue.toLocaleString()}`}
            color="text-teal-400"
            sub={`${latestSnapshot.yieldPct >= 0 ? "+" : ""}${latestSnapshot.yieldPct.toFixed(2)}%`}
          />
          <StatCard
            label="Funding Income"
            value={`$${latestSnapshot.fundingIncome.toLocaleString()}`}
            color="text-amber-400"
            sub={`${days} days`}
          />
          <StatCard
            label="Annualized APY"
            value={`${latestSnapshot.annualizedYield.toFixed(1)}%`}
            color={latestSnapshot.annualizedYield >= 0 ? "text-emerald-400" : "text-rose-400"}
            sub="projected"
          />
          <StatCard
            label="Net Delta"
            value={latestSnapshot.delta.toFixed(4)}
            color={Math.abs(latestSnapshot.delta) < 0.001 ? "text-teal-400" : "text-amber-400"}
            sub="target: 0"
          />
        </div>

        {/* Ethena USDe Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-500" />
              Ethena USDe Model
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6b8a99]">USDe Supply</span>
                    <span className="font-mono text-white">${(usdeSupply / 1e9).toFixed(1)}B</span>
                  </div>
                  <Slider
                    value={[usdeSupply / 1e9]}
                    max={20}
                    min={0.1}
                    step={0.1}
                    onValueChange={(val) => setUsdeSupply(val[0] * 1e9)}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6b8a99]">Reserve Allocation</span>
                    <span className="font-mono text-white">{reservePct}%</span>
                  </div>
                  <Slider
                    value={[reservePct]}
                    max={50}
                    min={0}
                    step={1}
                    onValueChange={(val) => setReservePct(val[0])}
                  />
                </div>
              </div>
              <div className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Backing Ratio</span>
                  <span className="font-mono text-teal-400">{ethenaMetrics.backingRatio.toFixed(2)}:1</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Daily Funding Yield</span>
                  <span className="font-mono text-amber-400">${ethenaMetrics.dailyFundingYield.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">sUSDe APY</span>
                  <span className="font-mono text-emerald-400">{ethenaMetrics.annualizedYield.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Reserve Fund</span>
                  <span className="font-mono text-white">${(ethenaMetrics.reserveFund / 1e6).toFixed(0)}M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Short Perp Notional</span>
                  <span className="font-mono text-rose-400">${(ethenaMetrics.shortPerpNotional / 1e9).toFixed(1)}B</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Controls & Education */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Strategy Parameters</h3>

              {/* ETH Price */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">ETH Price</span>
                  <span className="font-mono text-white text-lg">${ethPrice.toLocaleString()}</span>
                </div>
                <Slider
                  value={[ethPrice]}
                  max={5000}
                  min={500}
                  step={50}
                  onValueChange={(val) => setEthPrice(val[0])}
                />
              </div>

              {/* Position Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Position Size</span>
                  <span className="font-mono text-white">${(positionSize / 1000).toFixed(0)}k</span>
                </div>
                <Slider
                  value={[positionSize / 1000]}
                  max={500}
                  min={1}
                  step={1}
                  onValueChange={(val) => setPositionSize(val[0] * 1000)}
                />
              </div>

              {/* Funding Rate */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Funding Rate (8h)</span>
                  <span className="font-mono text-white">{fundingRate.toFixed(4)}%</span>
                </div>
                <Slider
                  value={[fundingRate * 1000]}
                  max={100}
                  min={-50}
                  step={1}
                  onValueChange={(val) => setFundingRate(val[0] / 1000)}
                />
                <div className="flex gap-2">
                  {[
                    { label: "Bear", val: -0.005 },
                    { label: "Flat", val: 0.005 },
                    { label: "Bull", val: 0.01 },
                    { label: "Mania", val: 0.05 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setFundingRate(preset.val)}
                      aria-label={`Set funding rate to ${preset.label} preset (${preset.val}%)`}
                      className={`flex-1 text-xs py-1.5 rounded-md transition-colors border ${
                        Math.abs(fundingRate - preset.val) < 0.0001
                          ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400"
                          : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30] hover:text-[#d1fae5]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Volatility */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Price Volatility</span>
                  <span className="font-mono text-white">{volatility}%</span>
                </div>
                <Slider
                  value={[volatility]}
                  max={30}
                  min={1}
                  step={1}
                  onValueChange={(val) => setVolatility(val[0])}
                />
              </div>

              {/* Leverage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Perp Leverage</span>
                  <span className="font-mono text-white">{leverage}x</span>
                </div>
                <Slider
                  value={[leverage]}
                  max={20}
                  min={1}
                  step={1}
                  onValueChange={(val) => setLeverage(val[0])}
                />
              </div>

              {/* Time range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Simulation Period</span>
                  <span className="font-mono text-white">{days} days</span>
                </div>
                <div className="flex gap-2">
                  {[30, 90, 180, 365].map((v) => (
                    <button
                      key={v}
                      onClick={() => setDays(v)}
                      aria-label={`Set simulation period to ${v} days`}
                      className={`flex-1 text-xs py-1.5 rounded-md transition-colors border ${
                        days === v
                          ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-400"
                          : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30] hover:text-[#d1fae5]"
                      }`}
                    >
                      {v <= 30 ? "1M" : v <= 90 ? "3M" : v <= 180 ? "6M" : "1Y"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk metrics */}
              <div className="border-t border-[#132d30] pt-4 space-y-3">
                <h4 className="text-sm font-semibold text-white">Risk Metrics</h4>
                <motion.div
                  className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
                  initial={false}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Margin Required</span>
                    <span className="text-white font-mono">${risks.marginRequired.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Liq. Price (short)</span>
                    <span className="text-rose-400 font-mono">${risks.liquidationPriceUp.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Daily Funding</span>
                    <span className={`font-mono ${risks.dailyFundingIncome >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {risks.dailyFundingIncome >= 0 ? "+" : ""}${risks.dailyFundingIncome.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Break-even</span>
                    <span className="text-amber-400 font-mono">
                      {risks.breakEvenDays === Infinity ? "N/A" : `${risks.breakEvenDays} days`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Neg. funding buffer</span>
                    <span className="text-white font-mono">{risks.maxNegFundingDays} days</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Concept Explainer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              Understanding Delta Neutral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeltaNeutralConceptExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ label, value, color, sub }: { label: string; value: string; color: string; sub?: string }) {
  return (
    <motion.div
      className="glass-card rounded-xl p-4 text-center"
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <div className={`text-lg sm:text-xl font-mono font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-[#6b8a99] mt-1">{label}</div>
      {sub && <div className="text-[10px] text-[#3b6b6b]">{sub}</div>}
    </motion.div>
  )
}
