"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  LEGO_BLOCKS,
  STRATEGY_TEMPLATES,
  calculateStack,
  generateFlow,
  LegoBlock,
} from "@/lib/composabilityEngine"
import ComposabilityConceptExplainer from "./ComposabilityConceptExplainer"

const BLOCK_COLORS: Record<string, string> = {
  teal: "border-teal-500/40 bg-teal-950/30 text-teal-400",
  amber: "border-amber-500/40 bg-amber-950/30 text-amber-400",
  cyan: "border-cyan-500/40 bg-cyan-950/30 text-cyan-400",
  rose: "border-rose-500/40 bg-rose-950/30 text-rose-400",
  emerald: "border-emerald-500/40 bg-emerald-950/30 text-emerald-400",
  purple: "border-purple-500/40 bg-purple-950/30 text-purple-400",
}

const BLOCK_DOT_COLORS: Record<string, string> = {
  teal: "bg-teal-500",
  amber: "bg-amber-500",
  cyan: "bg-cyan-500",
  rose: "bg-rose-500",
  emerald: "bg-emerald-500",
  purple: "bg-purple-500",
}

export default function ComposabilitySimulator() {
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(["lido-stake", "curve-lp", "convex-stake"])
  const [principal, setPrincipal] = useState(10000)

  const stackResult = useMemo(
    () => calculateStack(selectedBlockIds, principal),
    [selectedBlockIds, principal],
  )

  const flowSteps = useMemo(
    () => generateFlow(selectedBlockIds, principal),
    [selectedBlockIds, principal],
  )

  const addBlock = useCallback((id: string) => {
    setSelectedBlockIds((prev) => [...prev, id])
  }, [])

  const removeBlock = useCallback((index: number) => {
    setSelectedBlockIds((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const loadTemplate = useCallback((blockIds: readonly string[]) => {
    setSelectedBlockIds([...blockIds])
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Stack visualization */}
      <div className="lg:col-span-2 space-y-6">
        {/* Lego stack visualization */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              DeFi Stack Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Current stack */}
            <div className="space-y-3 mb-6">
              {selectedBlockIds.length === 0 ? (
                <div className="text-center py-12 text-[#6b8a99] text-sm">
                  Select blocks below or load a strategy template to get started
                </div>
              ) : (
                <AnimatePresence>
                  {stackResult.blocks.map((block, idx) => (
                    <motion.div
                      key={`${block.id}-${idx}`}
                      initial={{ opacity: 0, y: -20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 100, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: idx * 0.05 }}
                      className={`relative border rounded-lg p-4 ${BLOCK_COLORS[block.color]}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <div className={`w-3 h-3 rounded-full ${BLOCK_DOT_COLORS[block.color]}`} />
                            {idx < selectedBlockIds.length - 1 && (
                              <div className="w-px h-4 bg-[#132d30]" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{block.protocol}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[#071115]/80 text-[#6b8a99]">{block.action}</span>
                            </div>
                            <div className="text-xs text-[#6b8a99] mt-0.5">
                              {block.inputToken} → {block.outputToken}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-sm font-bold ${block.apy >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            {block.apy >= 0 ? "+" : ""}{block.apy}%
                          </span>
                          <button
                            onClick={() => removeBlock(idx)}
                            className="text-[#3b6b6b] hover:text-rose-400 transition-colors text-xs"
                            aria-label={`Remove ${block.protocol} ${block.action}`}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-[#3b6b6b]">{block.description}</div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Flow breakdown */}
            {flowSteps.length > 0 && (
              <div className="border-t border-[#132d30] pt-4">
                <h4 className="text-sm font-semibold text-white mb-3">Capital Flow</h4>
                <div className="space-y-2">
                  {flowSteps.map((step) => (
                    <div key={step.step} className="flex items-center justify-between text-xs bg-[#0f1d24]/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[#3b6b6b] font-mono w-5">{step.step}.</span>
                        <span className="text-white font-medium">{step.protocol}</span>
                        <span className="text-[#6b8a99]">{step.action}</span>
                      </div>
                      <div className="flex items-center gap-4 font-mono">
                        <span className="text-[#6b8a99]">${step.inputAmount.toLocaleString()} {step.inputToken}</span>
                        <span className="text-[#3b6b6b]">→</span>
                        <span className="text-white">${step.outputAmount.toLocaleString()} {step.outputToken}</span>
                        <span className={step.apyEarned >= 0 ? "text-emerald-400" : "text-rose-400"}>
                          {step.apyEarned >= 0 ? "+" : ""}{step.apyEarned}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Combined APY"
            value={`${stackResult.totalApy >= 0 ? "+" : ""}${stackResult.totalApy.toFixed(2)}%`}
            color={stackResult.totalApy >= 0 ? "text-emerald-400" : "text-rose-400"}
          />
          <StatCard
            label="Risk Score"
            value={`${stackResult.riskScore.toFixed(1)}/10`}
            color={stackResult.riskScore <= 5 ? "text-teal-400" : stackResult.riskScore <= 7 ? "text-amber-400" : "text-rose-400"}
          />
          <StatCard
            label="Capital Efficiency"
            value={`${stackResult.capitalEfficiency.toFixed(2)}x`}
            color="text-cyan-400"
          />
          <StatCard
            label="Net APY (after gas)"
            value={`${stackResult.netApy >= 0 ? "+" : ""}${stackResult.netApy.toFixed(2)}%`}
            color={stackResult.netApy >= 0 ? "text-emerald-400" : "text-rose-400"}
          />
        </div>
      </div>

      {/* Right column: Controls & Education */}
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white">Build Your Stack</h3>

              {/* Principal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#6b8a99]">Starting Capital</span>
                  <span className="font-mono text-white text-lg">${principal.toLocaleString()}</span>
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
                      aria-label={`Set capital to $${v.toLocaleString()}`}
                      className="qbtn"
                    >
                      {v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strategy templates */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#6b8a99]">Strategy Templates</h4>
                {STRATEGY_TEMPLATES.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => loadTemplate(template.blockIds)}
                    className="w-full text-left bg-[#0f1d24] hover:bg-[#132d30] border border-[#132d30] rounded-lg p-3 transition-colors"
                  >
                    <div className="text-sm font-medium text-white">{template.name}</div>
                    <div className="text-xs text-[#3b6b6b] mt-0.5">{template.description}</div>
                  </button>
                ))}
              </div>

              {/* Available blocks */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-[#6b8a99]">Available Blocks</h4>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {LEGO_BLOCKS.map((block) => (
                    <button
                      key={block.id}
                      onClick={() => addBlock(block.id)}
                      className={`text-left border rounded-lg p-2.5 transition-colors hover:brightness-125 ${BLOCK_COLORS[block.color]}`}
                    >
                      <div className="text-xs font-bold text-white">{block.protocol}</div>
                      <div className="text-[10px] text-[#6b8a99]">{block.action}</div>
                      <div className={`text-xs font-mono mt-1 ${block.apy >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {block.apy >= 0 ? "+" : ""}{block.apy}%
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear stack */}
              <Button
                variant="outline"
                onClick={() => setSelectedBlockIds([])}
                className="w-full"
              >
                Clear Stack
              </Button>

              {/* Summary box */}
              {stackResult.blocks.length > 0 && (
                <motion.div
                  className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
                  initial={false}
                  animate={{
                    borderColor: stackResult.totalApy > 10 ? "#14b8a6" : "#132d30",
                  }}
                >
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Layers</span>
                    <span className="text-white font-mono">{stackResult.blocks.length} protocols</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Gas Est. (one-time)</span>
                    <span className="text-amber-400 font-mono">~${stackResult.gasEstimate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#6b8a99]">Annual Yield ($)</span>
                    <span className="text-emerald-400 font-mono">
                      ${(principal * stackResult.totalApy / 100).toFixed(2)}
                    </span>
                  </div>
                  {/* Risk bar */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#6b8a99]">Risk</span>
                      <span className={
                        stackResult.riskScore <= 4 ? "text-teal-400" :
                        stackResult.riskScore <= 7 ? "text-amber-400" : "text-rose-400"
                      }>
                        {stackResult.riskScore.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#132d30] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          stackResult.riskScore <= 4 ? "bg-teal-500" :
                          stackResult.riskScore <= 7 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${stackResult.riskScore * 10}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Concept Explainer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              DeFi Composability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ComposabilityConceptExplainer />
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
