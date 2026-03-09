"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  createStableSwapPool,
  stableSwap,
  getD,
  getImbalanceRatio,
  getVirtualPrice,
  generateMultiACurves,
  StableSwapPool,
} from "@/lib/stableSwapEngine"
import StableSwapCurveChart from "./StableSwapCurveChart"
import MultiACurveChart from "./MultiACurveChart"
import StableSwapConceptExplainer from "./StableSwapConceptExplainer"

const INITIAL_BALANCE = 1_000_000 // 1M of each token
const INITIAL_A = 100

export default function StableSwapSimulator() {
  const [A, setA] = useState(INITIAL_A)
  const [poolBalance, setPoolBalance] = useState(INITIAL_BALANCE)
  const [pool, setPool] = useState<StableSwapPool>(() => createStableSwapPool(INITIAL_BALANCE, INITIAL_A))
  const [initialD, setInitialD] = useState(() => pool.D)
  const [swapAmount, setSwapAmount] = useState(10000)
  const [swapDirection, setSwapDirection] = useState<0 | 1>(0)
  const [feeRate, setFeeRate] = useState(0.0004)
  const [showConstantProduct, setShowConstantProduct] = useState(true)
  const [showConstantSum, setShowConstantSum] = useState(true)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [swapHistory, setSwapHistory] = useState<Array<{ direction: 0 | 1; amount: number; out: number; impact: number }>>([])

  // Recompute pool when A, poolBalance, or feeRate changes
  const resetPool = useCallback(() => {
    const newPool = createStableSwapPool(poolBalance, A, feeRate)
    setPool(newPool)
    setInitialD(newPool.D)
    setSwapHistory([])
  }, [A, poolBalance, feeRate])

  // Auto-reset pool when parameters change
  useEffect(() => {
    resetPool()
  }, [resetPool])

  // Preview the current swap
  const preview = useMemo(() => {
    if (swapAmount <= 0) return null
    try {
      return stableSwap({ ...pool, feeRate }, swapAmount, swapDirection)
    } catch {
      return null
    }
  }, [pool, swapAmount, swapDirection, feeRate])

  // Execute swap
  const executeSwap = useCallback(() => {
    if (!preview) return
    setPool((prev) => ({
      ...prev,
      x: preview.newX,
      y: preview.newY,
      D: getD([preview.newX, preview.newY], prev.A),
    }))
    setSwapHistory((prev) => [
      ...prev,
      { direction: swapDirection, amount: swapAmount, out: preview.amountOut, impact: preview.priceImpact },
    ])
  }, [preview, swapDirection, swapAmount])

  const imbalance = useMemo(() => getImbalanceRatio(pool), [pool])
  const virtualPrice = useMemo(() => getVirtualPrice(pool, initialD), [pool, initialD])

  const fromToken = swapDirection === 0 ? "USDC" : "USDT"
  const toToken = swapDirection === 0 ? "USDT" : "USDC"
  const maxSwap = swapDirection === 0 ? pool.x * 0.95 : pool.y * 0.95

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Curves & Visualizations */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Curve StableSwap — Bonding Curve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="curve">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="curve">Bonding Curve</TabsTrigger>
                <TabsTrigger value="compare">Compare A Values</TabsTrigger>
                <TabsTrigger value="history">Swap History</TabsTrigger>
              </TabsList>
              <TabsContent value="curve">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[400px]">
                  <StableSwapCurveChart
                    A={A}
                    D={pool.D}
                    currentX={pool.x}
                    currentY={pool.y}
                    showConstantProduct={showConstantProduct}
                    showConstantSum={showConstantSum}
                  />
                </motion.div>
                {/* Curve toggles */}
                <div className="flex gap-4 mt-3 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showConstantProduct}
                      onChange={(e) => setShowConstantProduct(e.target.checked)}
                      className="accent-rose-500"
                    />
                    <span className="text-rose-400">Constant Product (xy=k)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showConstantSum}
                      onChange={(e) => setShowConstantSum(e.target.checked)}
                      className="accent-amber-500"
                    />
                    <span className="text-amber-400">Constant Sum (x+y=D)</span>
                  </label>
                </div>
              </TabsContent>
              <TabsContent value="compare">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[400px]">
                  <MultiACurveChart D={pool.D} currentA={A} />
                </motion.div>
              </TabsContent>
              <TabsContent value="history">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <SwapHistoryTable history={swapHistory} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Pool state cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="USDC Balance" value={fmtBalance(pool.x)} color="text-teal-400" />
          <StatCard label="USDT Balance" value={fmtBalance(pool.y)} color="text-cyan-400" />
          <StatCard
            label="Pool Imbalance"
            value={`${imbalance.toFixed(1)}%`}
            color={imbalance < 5 ? "text-emerald-400" : imbalance < 20 ? "text-amber-400" : "text-rose-400"}
          />
          <StatCard label="Virtual Price" value={virtualPrice.toFixed(6)} color="text-white" />
        </div>
      </div>

      {/* Right column: Controls & Education */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">StableSwap Controls</h3>

              {/* Amplification A */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Amplification (A)</span>
                  <span className="font-mono text-white text-lg">{A}</span>
                </div>
                <Slider
                  value={[A]}
                  max={500}
                  min={1}
                  step={1}
                  onValueChange={(val) => setA(val[0])}
                />
                <div className="flex gap-2">
                  {[1, 10, 100, 500].map((v) => (
                    <button
                      key={v}
                      onClick={() => setA(v)}
                      aria-label={`Set A to ${v}`}
                      className={`flex-1 text-xs py-1.5 rounded-md transition-colors border ${
                        A === v
                          ? "bg-teal-600/20 border-teal-500/40 text-teal-400"
                          : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30] hover:text-[#d1fae5]"
                      }`}
                    >
                      A={v}
                    </button>
                  ))}
                </div>
                {/* Visual A spectrum */}
                <div className="flex h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 via-amber-500 to-teal-500 transition-all"
                    style={{ width: `${Math.min(100, (A / 500) * 100)}%` }}
                  />
                  <div className="bg-[#132d30] flex-1" />
                </div>
                <div className="flex justify-between text-[10px] text-[#3b6b6b]">
                  <span>&larr; More like xy=k</span>
                  <span>More like x+y=D &rarr;</span>
                </div>
              </div>

              {/* Swap direction */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSwapDirection(0)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                    swapDirection === 0
                      ? "bg-teal-600/20 border-teal-500/40 text-teal-400"
                      : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30]"
                  }`}
                >
                  USDC → USDT
                </button>
                <button
                  onClick={() => setSwapDirection(1)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors border ${
                    swapDirection === 1
                      ? "bg-cyan-600/20 border-cyan-500/40 text-cyan-400"
                      : "bg-[#0f1d24] border-[#132d30] text-[#6b8a99] hover:bg-[#132d30]"
                  }`}
                >
                  USDT → USDC
                </button>
              </div>

              {/* Swap amount */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">{fromToken} Amount</span>
                  <span className="font-mono text-white text-lg">{fmtBalance(swapAmount)}</span>
                </div>
                <Slider
                  value={[swapAmount]}
                  max={maxSwap}
                  min={100}
                  step={100}
                  onValueChange={(val) => setSwapAmount(val[0])}
                />
                <div className="flex gap-2">
                  {[0.01, 0.05, 0.1, 0.25].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setSwapAmount(Math.max(100, Math.round(maxSwap * pct)))}
                      aria-label={`Set swap to ${pct * 100}% of pool`}
                      className="qbtn"
                    >
                      {pct * 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {preview && (
                <motion.div
                  className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
                  initial={false}
                  animate={{
                    borderColor: preview.priceImpact > 1 ? "#dc2626" : preview.priceImpact > 0.1 ? "#f59e0b" : "#132d30",
                  }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Expected Output</span>
                    <span className="text-white font-mono">
                      {fmtBalance(preview.amountOut)} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Exchange Rate</span>
                    <span className="text-white font-mono">
                      1 {fromToken} = {(preview.amountOut / swapAmount).toFixed(6)} {toToken}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Price Impact</span>
                    <span className={
                      preview.priceImpact > 1 ? "text-rose-400 font-mono" :
                      preview.priceImpact > 0.1 ? "text-amber-400 font-mono" :
                      "text-emerald-400 font-mono"
                    }>
                      {preview.priceImpact.toFixed(4)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Fee ({(feeRate * 100).toFixed(2)}%)</span>
                    <span className="text-emerald-400 font-mono">{fmtBalance(preview.fee)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Spot Price After</span>
                    <span className="text-white font-mono">{preview.spotPriceAfter.toFixed(6)}</span>
                  </div>
                </motion.div>
              )}

              {/* Advanced settings */}
              <div>
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-[#3b6b6b] hover:text-[#a7d3c0] transition-colors"
                >
                  {showAdvanced ? "Hide" : "Show"} Advanced Settings
                </button>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-3 space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b8a99]">Fee Rate</span>
                        <span className="font-mono text-white">{(feeRate * 100).toFixed(2)}%</span>
                      </div>
                      <Slider
                        value={[feeRate * 10000]}
                        max={50}
                        min={1}
                        step={1}
                        onValueChange={(val) => setFeeRate(val[0] / 10000)}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#6b8a99]">Pool Size (each token)</span>
                        <span className="font-mono text-white">{fmtBalance(poolBalance)}</span>
                      </div>
                      <Slider
                        value={[poolBalance / 1000]}
                        max={10000}
                        min={10}
                        step={10}
                        onValueChange={(val) => setPoolBalance(val[0] * 1000)}
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button onClick={executeSwap} disabled={!preview} className="flex-1 bg-teal-600 hover:bg-teal-500 h-12 text-base">
                  Execute Swap
                </Button>
                <Button onClick={resetPool} variant="outline" className="h-12">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Concept Explainer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              How StableSwap Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StableSwapConceptExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ── Helpers ── */
function fmtBalance(v: number): string {
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return v.toFixed(2)
}

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

function SwapHistoryTable({ history }: { history: Array<{ direction: 0 | 1; amount: number; out: number; impact: number }> }) {
  if (history.length === 0) {
    return <div className="text-center py-12 text-[#6b8a99] text-sm">No swaps yet. Execute a swap to see history.</div>
  }

  return (
    <div className="space-y-2 py-2 max-h-[360px] overflow-y-auto">
      {history.map((swap, i) => (
        <div key={i} className="flex items-center justify-between text-xs bg-[#0f1d24]/50 border border-[#132d30] rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-[#3b6b6b] font-mono w-5">#{i + 1}</span>
            <span className="text-white">
              {swap.direction === 0 ? "USDC → USDT" : "USDT → USDC"}
            </span>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span className="text-[#6b8a99]">{fmtBalance(swap.amount)}</span>
            <span className="text-[#3b6b6b]">→</span>
            <span className="text-white">{fmtBalance(swap.out)}</span>
            <span className={
              swap.impact > 1 ? "text-rose-400" :
              swap.impact > 0.1 ? "text-amber-400" :
              "text-emerald-400"
            }>
              {swap.impact.toFixed(4)}%
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
