"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { calculateFlashLoan, FlashLoanResult } from "@/lib/flashLoanEngine"
import { PoolState } from "@/lib/mathEngine"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot,
} from "recharts"
import {
  Zap, AlertTriangle, CheckCircle2, RefreshCcw,
  ChevronDown, ChevronUp,
} from "lucide-react"

/* ── Pool constants ── */
const BASE_ETH = 100
const BASE_USDC = 200_000
const K = BASE_ETH * BASE_USDC

const UNI_POOL: PoolState = {
  tokenX: BASE_ETH,
  tokenY: BASE_USDC,
  k: K,
  initialPrice: BASE_USDC / BASE_ETH,
}

function buildSushiPool(spreadPct: number): PoolState {
  const sushiPrice = (BASE_USDC / BASE_ETH) * (1 + spreadPct / 100)
  const tokenX = Math.sqrt(K / sushiPrice)
  const tokenY = Math.sqrt(K * sushiPrice)
  return { tokenX, tokenY, k: K, initialPrice: sushiPrice }
}

/* ── Custom Tooltip for profit chart ── */
function ProfitTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; payload: { amount: number } }> }) {
  if (!active || !payload?.length) return null
  const { value } = payload[0]
  return (
    <div className="bg-[#0a0a1a] border border-indigo-900/40 rounded-lg px-3 py-2 text-xs">
      <div className="text-slate-400">Borrow: <span className="text-white font-mono">${payload[0].payload.amount}k USDC</span></div>
      <div className={value >= 0 ? "text-emerald-400" : "text-rose-400"}>
        Profit: <span className="font-mono">{value >= 0 ? "+" : ""}${value.toFixed(2)}</span>
      </div>
    </div>
  )
}

/* ── Profit curve chart ── */
function ProfitCurveChart({
  data,
  currentAmount,
  optimalAmount,
}: {
  data: { amount: number; profit: number }[]
  currentAmount: number
  optimalAmount: number
}) {
  const currentProfit = data.find(d => d.amount === currentAmount)?.profit ?? 0
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a35" />
        <XAxis dataKey="amount" stroke="#4a5080" tick={{ fontSize: 10, fill: "#4a5080" }}
          tickFormatter={v => `${v}k`} />
        <YAxis stroke="#4a5080" tick={{ fontSize: 10, fill: "#4a5080" }}
          tickFormatter={v => `$${v.toFixed(0)}`} />
        <Tooltip content={<ProfitTooltip />} />
        <ReferenceLine y={0} stroke="#334155" strokeDasharray="4 4" />
        <ReferenceLine x={optimalAmount} stroke="#8b5cf6" strokeDasharray="4 4"
          label={{ value: "Optimal", fill: "#8b5cf6", fontSize: 10, position: "top" }} />
        <ReferenceDot x={currentAmount} y={currentProfit} r={5} fill="#6366f1" stroke="#0a0a1a" strokeWidth={2} />
        <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2}
          fill="url(#profitGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

/* ── Atomic flow diagram ── */
const FLOW_STEPS = [
  { num: 1, label: "Aave Flash Loan", color: "cyan" },
  { num: 2, label: "Buy ETH on Uniswap", color: "blue" },
  { num: 3, label: "Sell ETH on SushiSwap", color: "purple" },
  { num: 4, label: "Repay Aave + Fee", color: "amber" },
  { num: 5, label: "Capture Profit", color: "result" },
]

const colorMap: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  cyan:   { bg: "bg-cyan-950/30",    border: "border-cyan-800/40",    text: "text-cyan-300",    dot: "bg-cyan-400" },
  blue:   { bg: "bg-blue-950/30",    border: "border-blue-800/40",    text: "text-blue-300",    dot: "bg-blue-400" },
  purple: { bg: "bg-purple-950/30",  border: "border-purple-800/40",  text: "text-purple-300",  dot: "bg-purple-400" },
  amber:  { bg: "bg-amber-950/20",   border: "border-amber-800/40",   text: "text-amber-300",   dot: "bg-amber-400" },
  green:  { bg: "bg-emerald-950/30", border: "border-emerald-800/40", text: "text-emerald-300", dot: "bg-emerald-400" },
  red:    { bg: "bg-rose-950/30",    border: "border-rose-800/40",    text: "text-rose-300",    dot: "bg-rose-400" },
}

function FlowDiagram({
  result,
  phase,
  borrowAmount,
}: {
  result: FlashLoanResult
  phase: number
  borrowAmount: number
}) {
  const steps = [
    { ...FLOW_STEPS[0], detail: `Borrow $${borrowAmount.toLocaleString()} USDC (0 collateral needed)` },
    { ...FLOW_STEPS[1], detail: `$${borrowAmount.toLocaleString()} USDC → ${result.ethFromUni.toFixed(4)} ETH` },
    { ...FLOW_STEPS[2], detail: `${result.ethFromUni.toFixed(4)} ETH → $${result.usdcFromSushi.toFixed(2)} USDC` },
    { ...FLOW_STEPS[3], detail: `Return $${result.repaymentRequired.toFixed(2)} USDC to Aave` },
    {
      ...FLOW_STEPS[4],
      color: result.isReverted ? "red" : "green",
      label: result.isReverted ? "TX REVERTED ✗" : "Profit Captured ✓",
      detail: result.isReverted
        ? `Insufficient funds — ${result.revertReason}`
        : `+$${result.profit.toFixed(2)} USDC net profit`,
    },
  ]

  return (
    <div className="relative">
      {/* Atomic block border */}
      <div className="absolute inset-0 border border-dashed border-indigo-900/40 rounded-xl pointer-events-none" />
      <div className="absolute top-2 right-3 text-[10px] text-indigo-700 font-mono">⬡ BLOCK N — ATOMIC TX</div>

      <div className="p-4 pt-6 space-y-1.5">
        {steps.map((step, i) => {
          const isActive = phase >= step.num
          const isLast = i === steps.length - 1
          const c = colorMap[step.color] ?? colorMap.blue
          return (
            <div key={step.num}>
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                  isActive ? `${c.bg} ${c.border}` : "bg-slate-900/20 border-slate-800/30"
                }`}
                animate={{ opacity: isActive ? 1 : 0.35 }}
                transition={{ duration: 0.4 }}
              >
                <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold
                  ${isActive ? "bg-indigo-900/60 text-indigo-300" : "bg-slate-800 text-slate-600"}`}>
                  {step.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${isActive ? c.text : "text-slate-600"}`}>{step.label}</div>
                  <div className="text-xs text-slate-500 truncate">{step.detail}</div>
                </div>
                {phase === step.num && !isLast && (
                  <div className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
                )}
                {isActive && phase > step.num && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
              </motion.div>
              {i < steps.length - 1 && (
                <div className="flex justify-center h-3 items-center">
                  <div className={`w-px h-full ${phase > step.num ? "bg-indigo-800/60" : "bg-slate-800/40"}`} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Step breakdown table ── */
function StepBreakdown({ result }: { result: FlashLoanResult }) {
  const rows = [
    { label: "Borrowed from Aave", value: `$${result.borrowAmount.toLocaleString()}`, color: "text-cyan-400" },
    { label: "Flash Loan Fee (0.09%)", value: `-$${(result.repaymentRequired - result.borrowAmount).toFixed(2)}`, color: "text-amber-400" },
    { label: "Must Repay Aave", value: `$${result.repaymentRequired.toFixed(2)}`, color: "text-white" },
    { label: "ETH Bought on Uniswap", value: `${result.ethFromUni.toFixed(6)} ETH`, color: "text-blue-400" },
    { label: "USDC from SushiSwap", value: `$${result.usdcFromSushi.toFixed(2)}`, color: "text-purple-400" },
    { label: "Net Profit / Loss", value: `${result.profit >= 0 ? "+" : ""}$${result.profit.toFixed(2)}`, color: result.profit >= 0 ? "text-emerald-400" : "text-rose-400" },
  ]
  return (
    <div className="space-y-2 py-3">
      {rows.map(({ label, value, color }, i) => (
        <div key={i} className={`flex justify-between items-center py-2 px-3 rounded-lg ${
          i === rows.length - 1 ? "bg-indigo-950/30 border border-indigo-900/30" : "border-b border-slate-800/50"
        }`}>
          <span className="text-sm text-slate-400">{label}</span>
          <span className={`font-mono text-sm font-semibold ${color}`}>{value}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Educational accordion ── */
const LEARN_SECTIONS = [
  {
    title: "What is a Flash Loan?",
    body: "A flash loan lets you borrow any amount of assets with zero collateral — but the borrow, use, and repayment must all happen in a single atomic blockchain transaction. If repayment fails, the entire transaction reverts as if it never happened.",
  },
  {
    title: "Why does arbitrage work?",
    body: "DEX prices drift when trading activity is uneven. A price discrepancy between Uniswap and SushiSwap creates an opportunity: borrow USDC, buy cheap ETH on one DEX, sell expensive ETH on the other, repay — and keep the spread.",
  },
  {
    title: "Why does borrow size matter?",
    body: "Larger borrows move prices more (price impact), shrinking the spread you exploit. There's an optimal borrow size that maximizes profit. Above it, AMM slippage eats more than the additional spread gained.",
  },
  {
    title: "Real-world risks",
    body: "In production, you compete with hundreds of bots for the same arbitrage. Gas costs must be paid even on reverted TXs. The window can close in milliseconds when another bot front-runs you or the spread collapses.",
  },
]

function FlashLoanExplainer() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {LEARN_SECTIONS.map((s, i) => (
        <div key={i} className="border border-slate-800 rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-slate-800/40 transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="text-sm font-medium text-slate-300">{s.title}</span>
            {open === i ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {open === i && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="px-4 pb-3 text-sm text-slate-400 leading-relaxed"
            >
              {s.body}
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── Main simulator ── */
export default function FlashLoanSimulator() {
  const [borrowAmount, setBorrowAmount] = useState(50_000)
  const [priceSpreadPct, setPriceSpreadPct] = useState(5)
  const [aaveFeeRate] = useState(0.0009)
  const [dexFeeRate] = useState(0.003)
  const [phase, setPhase] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const sushiPool = useMemo(() => buildSushiPool(priceSpreadPct), [priceSpreadPct])

  const result = useMemo(
    () => calculateFlashLoan(borrowAmount, UNI_POOL, sushiPool, aaveFeeRate, dexFeeRate),
    [borrowAmount, sushiPool, aaveFeeRate, dexFeeRate]
  )

  const profitCurveData = useMemo(() => {
    const pts = []
    for (let amount = 5000; amount <= 150_000; amount += 5000) {
      const r = calculateFlashLoan(amount, UNI_POOL, sushiPool, aaveFeeRate, dexFeeRate)
      pts.push({ amount: amount / 1000, profit: r.profit })
    }
    return pts
  }, [sushiPool, aaveFeeRate, dexFeeRate])

  const optimalPoint = useMemo(
    () => profitCurveData.reduce((best, p) => (p.profit > best.profit ? p : best), profitCurveData[0]),
    [profitCurveData]
  )

  const runAnimation = useCallback(() => {
    setIsRunning(true)
    setPhase(1)
    setTimeout(() => setPhase(2), 900)
    setTimeout(() => setPhase(3), 1800)
    setTimeout(() => setPhase(4), 2700)
    setTimeout(() => setPhase(5), 3600)
    setTimeout(() => setIsRunning(false), 4000)
  }, [])

  const uniPrice = UNI_POOL.tokenY / UNI_POOL.tokenX
  const sushiPrice = sushiPool.tokenY / sushiPool.tokenX
  const spreadUsd = sushiPrice - uniPrice

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Visualizations ── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Pool comparison */}
        <Card className="bg-[#0a0a1a]/80 border-[#1a1a35] backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Arbitrage Window: Price Discrepancy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Uniswap */}
              <div className="bg-blue-950/20 border border-blue-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold text-blue-400">U</div>
                  <span className="text-blue-400 font-semibold text-sm">Uniswap</span>
                  <span className="ml-auto text-[10px] text-blue-700 bg-blue-950/50 px-2 py-0.5 rounded font-mono">BUY</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">${uniPrice.toLocaleString()}</div>
                <div className="text-slate-500 text-xs mt-0.5">ETH / USDC</div>
                <div className="mt-3 space-y-1.5">
                  {[["ETH", `${UNI_POOL.tokenX} ETH`], ["USDC", `${UNI_POOL.tokenY.toLocaleString()}`]].map(([t, v]) => (
                    <div key={t} className="flex justify-between text-xs text-slate-500">
                      <span>{t} Reserve</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SushiSwap */}
              <div className="bg-purple-950/20 border border-purple-900/40 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-purple-400">S</div>
                  <span className="text-purple-400 font-semibold text-sm">SushiSwap</span>
                  <span className="ml-auto text-[10px] text-purple-700 bg-purple-950/50 px-2 py-0.5 rounded font-mono">SELL</span>
                </div>
                <div className="text-2xl font-mono font-bold text-white">${sushiPrice.toFixed(2)}</div>
                <div className="text-slate-500 text-xs mt-0.5">ETH / USDC</div>
                <div className="mt-3 space-y-1.5">
                  {[["ETH", `${sushiPool.tokenX.toFixed(2)} ETH`], ["USDC", `${sushiPool.tokenY.toFixed(0)}`]].map(([t, v]) => (
                    <div key={t} className="flex justify-between text-xs text-slate-500">
                      <span>{t} Reserve</span>
                      <span className="font-mono">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Spread badge */}
            <div className="flex items-center justify-between bg-emerald-950/20 border border-emerald-900/30 rounded-lg px-4 py-2.5">
              <span className="text-sm text-slate-400">Price Spread</span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono font-semibold">+${spreadUsd.toFixed(2)} / ETH</span>
                <span className="text-emerald-600 font-mono text-sm">({priceSpreadPct.toFixed(1)}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flash loan flow */}
        <Card className="bg-[#0a0a1a]/80 border-[#1a1a35] backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <Zap className="w-4 h-4 text-amber-400" />
              Atomic Flash Loan Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FlowDiagram result={result} phase={phase} borrowAmount={borrowAmount} />
          </CardContent>
        </Card>

        {/* Charts */}
        <Card className="bg-[#0a0a1a]/80 border-[#1a1a35] backdrop-blur">
          <CardContent className="p-4">
            <Tabs defaultValue="curve">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="curve">Profit vs. Borrow Size</TabsTrigger>
                <TabsTrigger value="breakdown">Step Breakdown</TabsTrigger>
              </TabsList>
              <TabsContent value="curve">
                <div className="h-[280px] pt-4">
                  <ProfitCurveChart
                    data={profitCurveData}
                    currentAmount={borrowAmount / 1000}
                    optimalAmount={optimalPoint.amount}
                  />
                </div>
              </TabsContent>
              <TabsContent value="breakdown">
                <StepBreakdown result={result} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* ── Right: Controls ── */}
      <div className="space-y-6">
        <Card className="bg-[#0a0a1a]/80 border-[#1a1a35] backdrop-blur">
          <CardContent className="p-6 space-y-6">
            <h3 className="text-base font-semibold text-white">Flash Loan Controls</h3>

            {/* Borrow amount */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Borrow from Aave</span>
                <span className="font-mono text-white text-base">{borrowAmount.toLocaleString()} USDC</span>
              </div>
              <Slider
                value={[borrowAmount]}
                min={5000} max={150000} step={5000}
                onValueChange={([v]) => setBorrowAmount(v)}
              />
              <div className="flex gap-1.5">
                {[25000, 50000, 75000, 100000].map(v => (
                  <button key={v} onClick={() => setBorrowAmount(v)}
                    className="flex-1 text-xs py-1.5 rounded-md bg-[#111128] hover:bg-[#1a1a35] text-slate-400 hover:text-slate-200 transition-colors border border-[#1a1a35]">
                    {v / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Price spread */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">SushiSwap Price Spread</span>
                <span className="font-mono text-emerald-400 text-base">+{priceSpreadPct}%</span>
              </div>
              <Slider
                value={[priceSpreadPct]}
                min={0.5} max={15} step={0.5}
                onValueChange={([v]) => setPriceSpreadPct(v)}
              />
              <div className="flex gap-1.5">
                {[2, 5, 8, 12].map(v => (
                  <button key={v} onClick={() => setPriceSpreadPct(v)}
                    className="flex-1 text-xs py-1.5 rounded-md bg-[#111128] hover:bg-[#1a1a35] text-slate-400 hover:text-slate-200 transition-colors border border-[#1a1a35]">
                    {v}%
                  </button>
                ))}
              </div>
            </div>

            {/* Live result card */}
            <motion.div
              className="rounded-xl border p-4 space-y-2.5"
              animate={{
                borderColor: result.isReverted ? "rgb(244 63 94 / 0.4)" : "rgb(16 185 129 / 0.4)",
                backgroundColor: result.isReverted ? "rgb(255 18 30 / 0.04)" : "rgb(16 185 129 / 0.04)",
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2">
                {result.isReverted ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span className="text-rose-400 font-semibold text-sm">TX REVERTED</span>
                    <span className="text-rose-600 text-xs ml-auto">{result.revertReason}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold text-sm">PROFITABLE</span>
                  </>
                )}
              </div>

              <div className="h-px bg-slate-800" />

              {[
                ["Flash Loan Fee", `-$${(result.repaymentRequired - result.borrowAmount).toFixed(2)}`],
                ["ETH Acquired", `${result.ethFromUni.toFixed(4)} ETH`],
                ["USDC from Sushi", `$${result.usdcFromSushi.toFixed(2)}`],
                ["Must Repay", `$${result.repaymentRequired.toFixed(2)}`],
              ].map(([label, val], i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-mono text-slate-300">{val}</span>
                </div>
              ))}

              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-sm text-slate-400">Net Profit</span>
                <span className={`font-mono text-base font-bold ${result.profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {result.profit >= 0 ? "+" : ""}${result.profit.toFixed(2)}
                </span>
              </div>
            </motion.div>

            {/* Optimal hint */}
            <div className="text-xs text-slate-500 bg-[#111128] border border-[#1a1a35] rounded-lg p-3">
              <span className="text-violet-400 font-semibold">Optimal borrow:</span>{" "}
              ${optimalPoint.amount}k USDC → max profit{" "}
              <span className="text-emerald-400">${optimalPoint.profit.toFixed(0)}</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                onClick={runAnimation}
                disabled={isRunning}
                className="flex-1 h-11 text-sm gap-2 bg-indigo-600 hover:bg-indigo-500 border-0"
              >
                <Zap className="w-4 h-4" />
                {isRunning ? "Executing..." : phase === 5 ? "Replay" : "Execute Flash Loan"}
              </Button>
              <Button
                onClick={() => setPhase(0)}
                variant="outline"
                className="h-11 border-[#1a1a35] hover:bg-[#111128]"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Explainer */}
        <Card className="bg-[#0a0a1a]/80 border-[#1a1a35] backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">How Flash Loans Work</CardTitle>
          </CardHeader>
          <CardContent>
            <FlashLoanExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
