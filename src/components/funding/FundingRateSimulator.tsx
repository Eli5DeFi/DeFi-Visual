"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  generateFundingHistory,
  calculatePositionPnL,
  annualizeFundingRate,
} from "@/lib/fundingEngine"
import FundingChart from "./FundingChart"
import FundingConceptExplainer from "./FundingConceptExplainer"

export default function FundingRateSimulator() {
  const [basePrice, setBasePrice] = useState(2000)
  const [totalOI, setTotalOI] = useState(50_000_000)
  const [longBias, setLongBias] = useState(0.6)
  const [volatility, setVolatility] = useState(5)
  const [positionSize, setPositionSize] = useState(10000)
  const [leverage, setLeverage] = useState(5)
  const [isLong, setIsLong] = useState(true)
  const [hours, setHours] = useState(168) // 1 week

  const history = useMemo(
    () => generateFundingHistory(basePrice, hours, longBias, volatility, totalOI),
    [basePrice, hours, longBias, volatility, totalOI],
  )

  const latestSnapshot = history[history.length - 1]
  const currentFundingRate = latestSnapshot.fundingRate

  // Cumulative funding rate over period
  const cumulativeFundingRate = useMemo(
    () => history.reduce((sum, s) => sum + s.fundingRate, 0),
    [history],
  )

  const positionPnL = useMemo(
    () => calculatePositionPnL(
      basePrice,
      latestSnapshot.markPrice,
      positionSize,
      leverage,
      isLong,
      cumulativeFundingRate,
    ),
    [basePrice, latestSnapshot.markPrice, positionSize, leverage, isLong, cumulativeFundingRate],
  )

  const annualizedRate = annualizeFundingRate(currentFundingRate)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Charts */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              Funding Rates & Open Interest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="funding">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="funding">Funding Rate</TabsTrigger>
                <TabsTrigger value="oi">Open Interest</TabsTrigger>
                <TabsTrigger value="cumulative">Cumulative Cost</TabsTrigger>
              </TabsList>
              <TabsContent value="funding">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[350px]">
                  <FundingChart
                    basePrice={basePrice}
                    hours={hours}
                    longBias={longBias}
                    volatility={volatility}
                    totalOI={totalOI}
                    mode="funding"
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="oi">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[350px]">
                  <FundingChart
                    basePrice={basePrice}
                    hours={hours}
                    longBias={longBias}
                    volatility={volatility}
                    totalOI={totalOI}
                    mode="oi"
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="cumulative">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[350px]">
                  <FundingChart
                    basePrice={basePrice}
                    hours={hours}
                    longBias={longBias}
                    volatility={volatility}
                    totalOI={totalOI}
                    mode="cumulative"
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Current Rate"
            value={`${currentFundingRate >= 0 ? "+" : ""}${currentFundingRate.toFixed(4)}%`}
            color={currentFundingRate >= 0 ? "text-teal-400" : "text-rose-400"}
            sub="per 8h"
          />
          <StatCard
            label="Annualized"
            value={`${annualizedRate >= 0 ? "+" : ""}${annualizedRate.toFixed(2)}%`}
            color={annualizedRate >= 0 ? "text-teal-400" : "text-rose-400"}
            sub="yearly"
          />
          <StatCard
            label="Long OI"
            value={`$${(latestSnapshot.longOI / 1e6).toFixed(1)}M`}
            color="text-teal-400"
            sub={`${(longBias * 100).toFixed(0)}% of total`}
          />
          <StatCard
            label="Short OI"
            value={`$${(latestSnapshot.shortOI / 1e6).toFixed(1)}M`}
            color="text-rose-400"
            sub={`${((1 - longBias) * 100).toFixed(0)}% of total`}
          />
        </div>
      </div>

      {/* Right column: Controls & Education */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Market Parameters</h3>

              {/* Base price */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Spot Price (ETH)</span>
                  <span className="font-mono text-white text-lg">${basePrice.toLocaleString()}</span>
                </div>
                <Slider
                  value={[basePrice]}
                  max={5000}
                  min={500}
                  step={50}
                  onValueChange={(val) => setBasePrice(val[0])}
                />
              </div>

              {/* Long/Short Bias */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Long/Short Bias</span>
                  <span className="font-mono text-white">
                    {longBias > 0.5 ? (
                      <span className="text-teal-400">{(longBias * 100).toFixed(0)}% Long</span>
                    ) : longBias < 0.5 ? (
                      <span className="text-rose-400">{((1 - longBias) * 100).toFixed(0)}% Short</span>
                    ) : (
                      <span className="text-amber-400">Balanced</span>
                    )}
                  </span>
                </div>
                <Slider
                  value={[longBias * 100]}
                  max={80}
                  min={20}
                  step={5}
                  onValueChange={(val) => setLongBias(val[0] / 100)}
                />
                {/* Visual bias bar */}
                <div className="flex h-3 rounded-full overflow-hidden">
                  <div className="bg-teal-500/60 transition-all" style={{ width: `${longBias * 100}%` }} />
                  <div className="bg-rose-500/60 transition-all" style={{ width: `${(1 - longBias) * 100}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-[#6b8a99]">
                  <span>Longs: {(longBias * 100).toFixed(0)}%</span>
                  <span>Shorts: {((1 - longBias) * 100).toFixed(0)}%</span>
                </div>
              </div>

              {/* Total OI */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Total Open Interest</span>
                  <span className="font-mono text-white">${(totalOI / 1e6).toFixed(0)}M</span>
                </div>
                <Slider
                  value={[totalOI / 1e6]}
                  max={500}
                  min={1}
                  step={1}
                  onValueChange={(val) => setTotalOI(val[0] * 1e6)}
                />
              </div>

              {/* Volatility */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Market Volatility</span>
                  <span className="font-mono text-white">{volatility}</span>
                </div>
                <Slider
                  value={[volatility]}
                  max={20}
                  min={1}
                  step={1}
                  onValueChange={(val) => setVolatility(val[0])}
                />
              </div>

              {/* Time range */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Time Range</span>
                  <span className="font-mono text-white">
                    {hours >= 168 ? `${(hours / 168).toFixed(hours % 168 === 0 ? 0 : 1)} week${hours >= 336 ? "s" : ""}` : `${hours}h`}
                  </span>
                </div>
                <div className="flex gap-2">
                  {[24, 72, 168, 336, 720].map((v) => (
                    <button
                      key={v}
                      onClick={() => setHours(v)}
                      aria-label={`Set time range to ${v} hours`}
                      className={`flex-1 text-xs py-1.5 rounded-md transition-colors border ${
                        hours === v
                          ? "bg-purple-600/20 border-purple-500/40 text-purple-400"
                          : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30] hover:text-[#d1fae5]"
                      }`}
                    >
                      {v <= 24 ? "1D" : v <= 72 ? "3D" : v <= 168 ? "1W" : v <= 336 ? "2W" : "1M"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Position calculator */}
              <div className="border-t border-[#132d30] pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-white">Position Calculator</h4>

                {/* Long / Short toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsLong(true)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                      isLong
                        ? "bg-teal-600/20 border-teal-500/40 text-teal-400"
                        : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30]"
                    }`}
                  >
                    Long
                  </button>
                  <button
                    onClick={() => setIsLong(false)}
                    className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                      !isLong
                        ? "bg-rose-600/20 border-rose-500/40 text-rose-400"
                        : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30]"
                    }`}
                  >
                    Short
                  </button>
                </div>

                {/* Position size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6b8a99]">Position Size</span>
                    <span className="font-mono text-white">${positionSize.toLocaleString()}</span>
                  </div>
                  <Slider
                    value={[positionSize]}
                    max={100000}
                    min={100}
                    step={100}
                    onValueChange={(val) => setPositionSize(val[0])}
                  />
                </div>

                {/* Leverage */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#6b8a99]">Leverage</span>
                    <span className="font-mono text-white">{leverage}x</span>
                  </div>
                  <Slider
                    value={[leverage]}
                    max={50}
                    min={1}
                    step={1}
                    onValueChange={(val) => setLeverage(val[0])}
                  />
                </div>

                {/* PnL Display */}
                <motion.div
                  className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
                  initial={false}
                  animate={{
                    borderColor: positionPnL.unrealizedPnL > 0 ? "#22c55e" : "#dc2626",
                  }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Unrealized PnL</span>
                    <span className={positionPnL.unrealizedPnL >= 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                      {positionPnL.unrealizedPnL >= 0 ? "+" : ""}${positionPnL.unrealizedPnL.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Funding Cost</span>
                    <span className={positionPnL.netFundingCost <= 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                      {positionPnL.netFundingCost > 0 ? "-" : "+"}${Math.abs(positionPnL.netFundingCost).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Margin Used</span>
                    <span className="text-white font-mono">${positionPnL.marginUsed.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Liq. Price</span>
                    <span className="text-amber-400 font-mono">${positionPnL.liquidationPrice.toFixed(2)}</span>
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
              Understanding Funding & OI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FundingConceptExplainer />
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
