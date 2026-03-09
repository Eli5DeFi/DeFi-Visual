"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  mintPTYT,
  getPTYTPricing,
  simulateOverTime,
  compareStrategies,
} from "@/lib/pendleEngine"
import { CHART_MARGIN, CHART_GRID, CHART_AXIS, CHART_TICK, CHART_TOOLTIP_STYLE } from "@/lib/constants"
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot, Legend,
} from "recharts"
import {
  ChevronDown, ChevronUp, ArrowRight, Lock, Unlock, TrendingUp,
} from "lucide-react"

/* ── Constants ── */
const ETH_PRICE = 2000

/* ── Tooltip components ── */
function PriceTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: { day: number } }>
}) {
  if (!active || !payload?.length) return null
  const day = payload[0].payload.day
  return (
    <div className="bg-[#071115] border border-teal-900/40 rounded-lg px-3 py-2 text-xs space-y-1">
      <div className="text-[#6b8a99] font-mono">Day {day}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-mono">{p.value.toFixed(4)}</span>
        </div>
      ))}
    </div>
  )
}

function StrategyTooltip({ active, payload }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string; payload: { day: number } }>
}) {
  if (!active || !payload?.length) return null
  const day = payload[0].payload.day
  return (
    <div className="bg-[#071115] border border-teal-900/40 rounded-lg px-3 py-2 text-xs space-y-1">
      <div className="text-[#6b8a99] font-mono">Day {day}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-mono">{(p.value * 100).toFixed(2)}%</span>
        </div>
      ))}
    </div>
  )
}

/* ── Token split visualization ── */
function TokenSplitViz({
  syAmount,
  exchangeRate,
  ptMinted,
  ytMinted,
  ptPrice,
  ytPrice,
}: {
  syAmount: number
  exchangeRate: number
  ptMinted: number
  ytMinted: number
  ptPrice: number
  ytPrice: number
}) {
  return (
    <div className="space-y-5">
      {/* SY deposit */}
      <div className="relative">
        <div className="bg-teal-950/30 border border-teal-800/40 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-600/20 border border-teal-500/30
                flex items-center justify-center text-sm font-bold text-teal-400">SY</div>
              <div>
                <div className="text-sm font-semibold text-teal-300">SY-stETH</div>
                <div className="text-xs text-[#6b8a99]">Standardized Yield Token</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-mono font-bold text-white">{syAmount}</div>
              <div className="text-xs text-[#6b8a99]">= {(syAmount * exchangeRate).toFixed(1)} ETH underlying</div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-xs text-teal-600 font-mono">YIELD TOKENIZE</div>
        <div className="flex items-center gap-2">
          <div className="w-px h-4 bg-teal-800/60" />
          <ArrowRight className="w-3 h-3 text-teal-600 rotate-90" />
          <div className="w-px h-4 bg-teal-800/60" />
        </div>
      </div>

      {/* PT + YT outputs */}
      <div className="grid grid-cols-2 gap-4">
        {/* PT */}
        <motion.div
          className="bg-cyan-950/20 border border-cyan-900/40 rounded-xl p-4"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-teal-600/20 border border-teal-500/30
              flex items-center justify-center text-xs font-bold text-cyan-400">PT</div>
            <div>
              <div className="text-sm font-semibold text-cyan-300">Principal Token</div>
              <div className="text-[10px] text-[#6b8a99]">Zero-coupon bond</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#6b8a99]">Minted</span>
              <span className="font-mono text-white">{ptMinted.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6b8a99]">Price</span>
              <span className="font-mono text-cyan-400">{ptPrice.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6b8a99]">At Maturity</span>
              <span className="font-mono text-emerald-400">1.0000 ETH</span>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 h-2 bg-[#0f1d24] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${ptPrice * 100}%` }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />
          </div>
          <div className="text-[10px] text-[#3b6b6b] mt-1 text-right">{(ptPrice * 100).toFixed(1)}% of underlying</div>
        </motion.div>

        {/* YT */}
        <motion.div
          className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/30
              flex items-center justify-center text-xs font-bold text-amber-400">YT</div>
            <div>
              <div className="text-sm font-semibold text-amber-300">Yield Token</div>
              <div className="text-[10px] text-[#6b8a99]">Yield claim until expiry</div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#6b8a99]">Minted</span>
              <span className="font-mono text-white">{ytMinted.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6b8a99]">Price</span>
              <span className="font-mono text-amber-400">{ytPrice.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#6b8a99]">At Maturity</span>
              <span className="font-mono text-rose-400">0.0000 ETH</span>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 h-2 bg-[#0f1d24] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${ytPrice * 100}%` }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          </div>
          <div className="text-[10px] text-[#3b6b6b] mt-1 text-right">{(ytPrice * 100).toFixed(1)}% of underlying</div>
        </motion.div>
      </div>

      {/* Invariant check */}
      <div className="flex items-center justify-center gap-3 text-xs">
        <span className="font-mono text-cyan-400">{ptPrice.toFixed(4)}</span>
        <span className="text-[#3b6b6b]">+</span>
        <span className="font-mono text-amber-400">{ytPrice.toFixed(4)}</span>
        <span className="text-[#3b6b6b]">=</span>
        <span className="font-mono text-emerald-400">{(ptPrice + ytPrice).toFixed(4)}</span>
        <span className="text-[#6b8a99]">&asymp; 1.0 underlying</span>
      </div>
    </div>
  )
}

/* ── Educational accordion ── */
const LEARN_SECTIONS = [
  {
    title: "SY: Standardized Yield (ERC-5115)",
    body: "SY wraps any yield-bearing token (stETH, aUSDC, cDAI) into a standard interface. The exchangeRate tracks how much underlying 1 SY is worth — it grows as yield accrues. Pendle proposed ERC-5115 because ERC-4626 couldn't cover LP tokens or native-reward assets.",
  },
  {
    title: "PT: The Zero-Coupon Bond",
    body: "PT (Principal Token) trades at a discount and is redeemable 1:1 for the underlying at maturity. Buying 1 PT-stETH at 0.95 ETH locks in a ~5% fixed yield. The discount narrows as maturity approaches — exactly like a TradFi zero-coupon bond.",
  },
  {
    title: "YT: Leveraged Yield Exposure",
    body: "YT (Yield Token) gives you the right to all yield generated by the underlying until maturity. Because YT is cheap (≈ the yield portion), you get leveraged exposure to APY changes. If underlying APY > implied APY at purchase, you profit. YT decays to 0 at maturity.",
  },
  {
    title: "Implied APY = Market Consensus",
    body: "Implied APY = [(1 + YT/PT)^(365/days)] − 1. It represents the market's best guess of future yield. If you think the real yield will be higher, buy YT. If you think it will be lower (or want certainty), buy PT. The AMM curve shifts automatically as maturity approaches.",
  },
]

function PendleExplainer() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {LEARN_SECTIONS.map((s, i) => (
        <div key={i} className="border border-[#132d30] rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#0f1d24]/60 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-medium text-[#a7d3c0]">{s.title}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-teal-400" /> : <ChevronDown className="w-4 h-4 text-[#3b6b6b]" />}
          </button>
          {open === i && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 pb-3 text-sm text-[#6b8a99] leading-relaxed"
            >
              {s.body}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Main component ── */
export default function PendleSimulator() {
  const [impliedAPY, setImpliedAPY] = useState(0.08)          // 8%
  const [underlyingAPY, setUnderlyingAPY] = useState(0.05)    // 5%
  const [maturityDays, setMaturityDays] = useState(180)
  const [syAmount, setSyAmount] = useState(100)
  const [exchangeRate, setExchangeRate] = useState(1.05)

  // Derived state
  const pricing = useMemo(
    () => getPTYTPricing(impliedAPY, maturityDays),
    [impliedAPY, maturityDays],
  )

  const mintResult = useMemo(
    () => mintPTYT(syAmount, exchangeRate),
    [syAmount, exchangeRate],
  )

  const timeSeries = useMemo(
    () => simulateOverTime(maturityDays, impliedAPY, underlyingAPY),
    [maturityDays, impliedAPY, underlyingAPY],
  )

  const strategy = useMemo(
    () => compareStrategies(1000, impliedAPY, underlyingAPY, maturityDays, ETH_PRICE),
    [impliedAPY, underlyingAPY, maturityDays],
  )

  const fixedYieldPct = ((1 / pricing.ptPrice - 1) * 100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Visualizations ── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Token split viz */}
        <Card className="bg-[#071115]/80 border-[#132d30] backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Yield Tokenization: SY → PT + YT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TokenSplitViz
              syAmount={syAmount}
              exchangeRate={exchangeRate}
              ptMinted={mintResult.ptMinted}
              ytMinted={mintResult.ytMinted}
              ptPrice={pricing.ptPrice}
              ytPrice={pricing.ytPrice}
            />
          </CardContent>
        </Card>

        {/* Charts */}
        <Card className="bg-[#071115]/80 border-[#132d30] backdrop-blur">
          <CardContent className="p-4">
            <Tabs defaultValue="prices">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="prices">PT / YT Prices</TabsTrigger>
                <TabsTrigger value="strategy">Strategy Returns</TabsTrigger>
                <TabsTrigger value="breakdown">Comparison</TabsTrigger>
              </TabsList>

              {/* Price curves */}
              <TabsContent value="prices">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[300px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeries} margin={CHART_MARGIN}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                      <XAxis dataKey="day" stroke={CHART_AXIS} tick={CHART_TICK}
                        tickFormatter={v => `D${v}`} />
                      <YAxis stroke={CHART_AXIS} tick={CHART_TICK}
                        domain={[0, 1.05]} tickFormatter={v => v.toFixed(2)} />
                      <Tooltip content={<PriceTooltip />} />
                      <ReferenceLine y={1} stroke="#132d30" strokeDasharray="4 4" label={{ value: "1.0 (par)", fill: "#3b6b6b", fontSize: 10 }} />
                      <Line type="monotone" dataKey="ptPrice" name="PT Price" stroke="#06b6d4"
                        strokeWidth={2.5} dot={false} />
                      <Line type="monotone" dataKey="ytPrice" name="YT Price" stroke="#f59e0b"
                        strokeWidth={2.5} dot={false} />
                      <Legend iconType="line" wrapperStyle={{ fontSize: 11, color: "#6b8a99" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </TabsContent>

              {/* Strategy returns */}
              <TabsContent value="strategy">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[300px] pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeries} margin={CHART_MARGIN}>
                      <defs>
                        <linearGradient id="ptGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ytGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} />
                      <XAxis dataKey="day" stroke={CHART_AXIS} tick={CHART_TICK}
                        tickFormatter={v => `D${v}`} />
                      <YAxis stroke={CHART_AXIS} tick={CHART_TICK}
                        tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                      <Tooltip content={<StrategyTooltip />} />
                      <ReferenceLine y={1} stroke="#132d30" strokeDasharray="4 4" />
                      <Area type="monotone" dataKey="ptTotalValue" name="PT (Fixed Yield)" stroke="#06b6d4"
                        strokeWidth={2} fill="url(#ptGrad)" dot={false} />
                      <Area type="monotone" dataKey="ytTotalValue" name="YT (Variable Yield)" stroke="#f59e0b"
                        strokeWidth={2} fill="url(#ytGrad)" dot={false} />
                      <Legend iconType="line" wrapperStyle={{ fontSize: 11, color: "#6b8a99" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              </TabsContent>

              {/* Strategy breakdown table */}
              <TabsContent value="breakdown">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-3">
                  <div className="text-xs text-[#6b8a99] mb-3 text-center">$1,000 investment comparison at current market rates</div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* PT strategy */}
                    <div className="bg-cyan-950/15 border border-cyan-900/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-semibold text-cyan-300">Buy PT (Fixed Yield)</span>
                      </div>
                      {[
                        ["PT Units", strategy.ptUnits.toFixed(2)],
                        ["Buy Price", `${pricing.ptPrice.toFixed(4)} ETH`],
                        ["Maturity Value", `$${(strategy.ptUnits * ETH_PRICE).toFixed(0)}`],
                        ["Fixed Return", `+$${strategy.ptFixedReturn.toFixed(2)}`],
                        ["ROI", `+${strategy.ptROI}%`],
                      ].map(([l, v], i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-[#6b8a99]">{l}</span>
                          <span className={`font-mono ${i >= 3 ? "text-emerald-400" : "text-white"}`}>{v}</span>
                        </div>
                      ))}
                      <div className="text-[10px] text-cyan-700 mt-2">Guaranteed return if held to maturity</div>
                    </div>

                    {/* YT strategy */}
                    <div className="bg-amber-950/15 border border-amber-900/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-semibold text-amber-300">Buy YT (Leveraged Yield)</span>
                      </div>
                      {[
                        ["YT Units", strategy.ytUnits.toFixed(2)],
                        ["Buy Price", `${pricing.ytPrice.toFixed(4)} ETH`],
                        ["Yield Earned", `$${(strategy.ytExpectedReturn + 1000).toFixed(0)}`],
                        ["Expected Return", `${strategy.ytExpectedReturn >= 0 ? "+" : ""}$${strategy.ytExpectedReturn.toFixed(2)}`],
                        ["ROI", `${strategy.ytROI >= 0 ? "+" : ""}${strategy.ytROI}%`],
                      ].map(([l, v], i) => (
                        <div key={i} className="flex justify-between text-xs">
                          <span className="text-[#6b8a99]">{l}</span>
                          <span className={`font-mono ${i >= 3 ? (strategy.ytExpectedReturn >= 0 ? "text-emerald-400" : "text-rose-400") : "text-white"}`}>{v}</span>
                        </div>
                      ))}
                      <div className="text-[10px] text-amber-700 mt-2">
                        Break-even APY: {(strategy.breakEvenAPY * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* ── Right: Controls ── */}
      <div className="space-y-6">
        {/* Market controls */}
        <Card className="bg-[#071115]/80 border-[#132d30] backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Market Parameters</h3>

            {/* Implied APY */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8a99]">Implied APY</span>
                <span className="font-mono text-teal-400 text-base">{(impliedAPY * 100).toFixed(1)}%</span>
              </div>
              <Slider
                value={[impliedAPY * 100]}
                min={1} max={30} step={0.5}
                onValueChange={([v]) => setImpliedAPY(v / 100)}
              />
              <div className="flex gap-1.5">
                {[3, 5, 8, 15].map(v => (
                  <button key={v} onClick={() => setImpliedAPY(v / 100)}
                    className="qbtn" aria-label={`Set implied APY to ${v}%`}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Underlying APY */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8a99]">Underlying APY (actual)</span>
                <span className="font-mono text-emerald-400 text-base">{(underlyingAPY * 100).toFixed(1)}%</span>
              </div>
              <Slider
                value={[underlyingAPY * 100]}
                min={0.5} max={25} step={0.5}
                onValueChange={([v]) => setUnderlyingAPY(v / 100)}
              />
              <div className="flex gap-1.5">
                {[2, 5, 10, 20].map(v => (
                  <button key={v} onClick={() => setUnderlyingAPY(v / 100)}
                    className="qbtn" aria-label={`Set underlying APY to ${v}%`}>
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Maturity days */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8a99]">Days to Maturity</span>
                <span className="font-mono text-white text-base">{maturityDays}d</span>
              </div>
              <Slider
                value={[maturityDays]}
                min={30} max={365} step={15}
                onValueChange={([v]) => setMaturityDays(v)}
              />
              <div className="flex gap-1.5">
                {[30, 90, 180, 365].map(v => (
                  <button key={v} onClick={() => setMaturityDays(v)}
                    className="qbtn" aria-label={`Set maturity to ${v} days`}>
                    {v}d
                  </button>
                ))}
              </div>
            </div>

            {/* SY amount */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8a99]">SY Amount</span>
                <span className="font-mono text-white text-base">{syAmount} SY</span>
              </div>
              <Slider
                value={[syAmount]}
                min={10} max={500} step={10}
                onValueChange={([v]) => setSyAmount(v)}
              />
            </div>

            {/* Exchange rate */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[#6b8a99]">SY Exchange Rate</span>
                <span className="font-mono text-cyan-400 text-base">{exchangeRate.toFixed(2)}</span>
              </div>
              <Slider
                value={[exchangeRate * 100]}
                min={100} max={130} step={1}
                onValueChange={([v]) => setExchangeRate(v / 100)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing dashboard */}
        <Card className="bg-[#071115]/80 border-[#132d30] backdrop-blur">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Live Pricing</h3>

            <div className="grid grid-cols-2 gap-3">
              {/* PT price */}
              <div className="bg-cyan-950/20 border border-cyan-900/30 rounded-lg p-3 text-center">
                <div className="text-[10px] text-cyan-700 uppercase tracking-wider">PT Price</div>
                <div className="text-lg font-mono font-bold text-cyan-400">{pricing.ptPrice.toFixed(4)}</div>
                <div className="text-[10px] text-[#3b6b6b]">ETH per PT</div>
              </div>
              {/* YT price */}
              <div className="bg-amber-950/20 border border-amber-900/30 rounded-lg p-3 text-center">
                <div className="text-[10px] text-amber-700 uppercase tracking-wider">YT Price</div>
                <div className="text-lg font-mono font-bold text-amber-400">{pricing.ytPrice.toFixed(4)}</div>
                <div className="text-[10px] text-[#3b6b6b]">ETH per YT</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                ["Fixed APY (buy PT)", `${(pricing.fixedAPY * 100).toFixed(2)}%`, "text-cyan-400"],
                ["Implied APY", `${(pricing.impliedAPY * 100).toFixed(2)}%`, "text-teal-400"],
                ["Underlying APY", `${(underlyingAPY * 100).toFixed(2)}%`, "text-emerald-400"],
                ["PT Discount", `${fixedYieldPct.toFixed(2)}%`, "text-cyan-400"],
                ["YT Leverage", `${(1 / pricing.ytPrice).toFixed(1)}×`, "text-amber-400"],
              ].map(([label, value, color], i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-[#132d30] last:border-0">
                  <span className="text-[#6b8a99]">{label}</span>
                  <span className={`font-mono font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>

            {/* Market signal */}
            <motion.div
              className="rounded-lg border p-3 text-center"
              animate={{
                borderColor: underlyingAPY > impliedAPY ? "rgb(16 185 129 / 0.3)" : "rgb(244 63 94 / 0.3)",
                backgroundColor: underlyingAPY > impliedAPY ? "rgb(16 185 129 / 0.04)" : "rgb(244 63 94 / 0.04)",
              }}
            >
              {underlyingAPY > impliedAPY ? (
                <div className="text-xs text-emerald-400">
                  Underlying APY ({(underlyingAPY * 100).toFixed(1)}%) &gt; Implied ({(impliedAPY * 100).toFixed(1)}%) →
                  <span className="font-bold"> YT is undervalued</span>
                </div>
              ) : (
                <div className="text-xs text-rose-400">
                  Underlying APY ({(underlyingAPY * 100).toFixed(1)}%) &lt; Implied ({(impliedAPY * 100).toFixed(1)}%) →
                  <span className="font-bold"> PT is the safer bet</span>
                </div>
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Explainer */}
        <Card className="bg-[#071115]/80 border-[#132d30] backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">How Pendle Works</CardTitle>
          </CardHeader>
          <CardContent>
            <PendleExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
