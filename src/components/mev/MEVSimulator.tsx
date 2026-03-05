"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { calculateSandwichAttack, findOptimalAttack, SandwichResult } from "@/lib/mevEngine"
import { PoolState } from "@/lib/mathEngine"
import MempoolVisualizer from "./MempoolVisualizer"
import MEVConceptExplainer from "./MEVConceptExplainer"
import ProfitChart from "./ProfitChart"

const INITIAL_POOL: PoolState = {
  tokenX: 100,   // 100 ETH
  tokenY: 200000, // 200k USDC
  k: 20000000,
  initialPrice: 2000,
}

export default function MEVSimulator() {
  const [victimUsdc, setVictimUsdc] = useState(10000)
  const [attackerUsdc, setAttackerUsdc] = useState(50000)
  const [feeRate, setFeeRate] = useState(0.003)
  const [phase, setPhase] = useState<"idle" | "frontrun" | "victim" | "backrun" | "complete">("idle")
  const [showAdvanced, setShowAdvanced] = useState(false)

  const attackResult = useMemo(() => {
    return calculateSandwichAttack(INITIAL_POOL, victimUsdc, attackerUsdc, feeRate)
  }, [victimUsdc, attackerUsdc, feeRate])

  const optimalAttack = useMemo(() => {
    return findOptimalAttack(INITIAL_POOL, victimUsdc, feeRate, 80)
  }, [victimUsdc, feeRate])

  const triggerAttack = useCallback(() => {
    setPhase("idle")
    setTimeout(() => setPhase("frontrun"), 200)
    setTimeout(() => setPhase("victim"), 1200)
    setTimeout(() => setPhase("backrun"), 2200)
    setTimeout(() => setPhase("complete"), 3200)
  }, [])

  const resetAttack = useCallback(() => {
    setPhase("idle")
  }, [])

  const isRunning = phase !== "idle" && phase !== "complete"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Visualizations */}
      <div className="lg:col-span-2 space-y-6">
        {/* Mempool Visualizer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Block Builder: Mempool Visualizer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MempoolVisualizer
              phase={phase}
              attackResult={attackResult}
              victimUsdc={victimUsdc}
              initialPool={INITIAL_POOL}
            />
          </CardContent>
        </Card>

        {/* Charts */}
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="profit">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="profit">Attacker Profit Curve</TabsTrigger>
                <TabsTrigger value="anatomy">Attack Breakdown</TabsTrigger>
              </TabsList>
              <TabsContent value="profit">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[300px]"
                >
                  <ProfitChart
                    data={optimalAttack.results}
                    currentCapital={attackerUsdc}
                    optimalCapital={optimalAttack.optimalAttackerUsdc}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="anatomy">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <AttackBreakdown result={attackResult} initialPool={INITIAL_POOL} />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Controls and Education */}
      <div className="space-y-6">
        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Sandwich Attack Controls</h3>

              {/* Victim Trade Size */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Victim Trade Size</span>
                  <span className="font-mono text-white text-lg">
                    {victimUsdc.toLocaleString()} USDC
                  </span>
                </div>
                <Slider
                  value={[victimUsdc]}
                  max={50000}
                  min={1000}
                  step={1000}
                  onValueChange={(val) => setVictimUsdc(val[0])}
                />
                <div className="flex gap-2">
                  {[5000, 10000, 25000, 50000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVictimUsdc(v)}
                      aria-label={`Set victim trade to ${(v / 1000).toFixed(0)}k USDC`}
                      className="qbtn"
                    >
                      {(v / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Attacker Capital */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Attacker Capital (Flash Loan)</span>
                  <span className="font-mono text-white text-lg">
                    {attackerUsdc.toLocaleString()} USDC
                  </span>
                </div>
                <Slider
                  value={[attackerUsdc]}
                  max={100000}
                  min={1000}
                  step={1000}
                  onValueChange={(val) => setAttackerUsdc(val[0])}
                />
                <div className="flex gap-2">
                  {[10000, 25000, 50000, 100000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAttackerUsdc(v)}
                      aria-label={`Set attacker capital to ${(v / 1000).toFixed(0)}k USDC`}
                      className="qbtn"
                    >
                      {(v / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit Preview */}
              <motion.div
                className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
                initial={false}
                animate={{
                  borderColor: attackResult.attackerProfitUsdc > 0 ? "#22c55e" : "#dc2626",
                }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Attacker Profit</span>
                  <span className={attackResult.attackerProfitUsdc > 0 ? "text-emerald-400 font-mono" : "text-rose-400 font-mono"}>
                    {attackResult.attackerProfitUsdc > 0 ? "+" : ""}${attackResult.attackerProfitUsdc.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Victim Slippage</span>
                  <span className="text-rose-400 font-mono">
                    {attackResult.step2Victim.slippageSuffered.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Optimal Capital</span>
                  <span className="text-cyan-400 font-mono">
                    ${optimalAttack.optimalAttackerUsdc.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#6b8a99]">Max Extractable</span>
                  <span className="text-emerald-400 font-mono">
                    +${optimalAttack.maxProfit.toFixed(2)}
                  </span>
                </div>
              </motion.div>

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
                    className="mt-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#6b8a99]">Fee Rate</span>
                      <span className="font-mono text-white">{(feeRate * 100).toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[feeRate * 1000]}
                      max={10}
                      min={1}
                      step={1}
                      onValueChange={(val) => setFeeRate(val[0] / 1000)}
                    />
                  </motion.div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={triggerAttack}
                  disabled={isRunning}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 h-12 text-base"
                >
                  {isRunning ? "Executing..." : phase === "complete" ? "Replay Attack" : "Submit Victim Swap"}
                </Button>
                <Button onClick={resetAttack} variant="outline" className="h-12">
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
              The Dark Forest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MEVConceptExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ── Attack Breakdown sub-component ── */
function AttackBreakdown({ result, initialPool }: { result: SandwichResult; initialPool: PoolState }) {
  const steps = [
    {
      label: "Initial Pool State",
      color: "text-[#6b8a99]",
      bg: "bg-[#0f1d24]/50",
      items: [
        ["ETH Reserve", `${initialPool.tokenX.toFixed(2)} ETH`],
        ["USDC Reserve", `${initialPool.tokenY.toLocaleString()} USDC`],
        ["Price", `$${result.priceBeforeAttack.toFixed(2)}/ETH`],
      ],
    },
    {
      label: "1. Front-Run (Attacker Buys ETH)",
      color: "text-rose-400",
      bg: "bg-rose-950/30",
      items: [
        ["ETH Acquired", `${result.step1FrontRun.attackerEthGained.toFixed(4)} ETH`],
        ["New Price", `$${result.priceAfterFrontRun.toFixed(2)}/ETH`],
        ["Price Moved", `+${(((result.priceAfterFrontRun - result.priceBeforeAttack) / result.priceBeforeAttack) * 100).toFixed(2)}%`],
      ],
    },
    {
      label: "2. Victim Swap Executes",
      color: "text-cyan-400",
      bg: "bg-cyan-950/30",
      items: [
        ["Expected ETH", `${result.step2Victim.expectedEth.toFixed(4)} ETH`],
        ["Actually Got", `${result.step2Victim.victimEthReceived.toFixed(4)} ETH`],
        ["Lost to Slippage", `${(result.step2Victim.expectedEth - result.step2Victim.victimEthReceived).toFixed(4)} ETH`],
      ],
    },
    {
      label: "3. Back-Run (Attacker Sells ETH)",
      color: "text-rose-400",
      bg: "bg-rose-950/30",
      items: [
        ["USDC Received", `$${result.step3BackRun.attackerUsdcReturned.toFixed(2)}`],
        ["Final Price", `$${result.priceAfterBackRun.toFixed(2)}/ETH`],
        ["Net Profit", `$${result.attackerProfitUsdc.toFixed(2)}`],
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
