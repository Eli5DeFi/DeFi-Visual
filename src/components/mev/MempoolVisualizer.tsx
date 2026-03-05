"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PoolState } from "@/lib/mathEngine"
import { SandwichResult } from "@/lib/mevEngine"

type Phase = "idle" | "frontrun" | "victim" | "backrun" | "complete"

interface MempoolVisualizerProps {
  phase: Phase
  attackResult: SandwichResult
  victimUsdc: number
  initialPool: PoolState
}

export default function MempoolVisualizer({
  phase,
  attackResult,
  victimUsdc,
  initialPool,
}: MempoolVisualizerProps) {
  const showFrontRun = phase === "frontrun" || phase === "victim" || phase === "backrun" || phase === "complete"
  const showVictimExecuted = phase === "victim" || phase === "backrun" || phase === "complete"
  const showBackRun = phase === "backrun" || phase === "complete"
  const showProfit = phase === "complete"

  const expectedEth = victimUsdc / initialPool.initialPrice

  return (
    <div className="relative w-full min-h-[480px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(239,68,68,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Scanning line effect during attack */}
      <AnimatePresence>
        {(phase === "frontrun" || phase === "victim" || phase === "backrun") && (
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent"
            initial={{ top: 0, opacity: 0 }}
            animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </AnimatePresence>

      {/* Block container */}
      <div className="relative flex flex-col items-center gap-3 w-full max-w-lg px-4">

        {/* Block header */}
        <motion.div
          className="w-full text-center mb-2"
          animate={{
            color: phase === "idle" ? "#94a3b8" : "#f87171",
          }}
        >
          <div className="text-xs font-mono tracking-wider uppercase">
            {phase === "idle" && "Mempool - Awaiting Transactions"}
            {phase === "frontrun" && "Bot Detected Target - Inserting Front-Run"}
            {phase === "victim" && "Victim Transaction Executing..."}
            {phase === "backrun" && "Inserting Back-Run Transaction"}
            {phase === "complete" && "Block Finalized - Sandwich Complete"}
          </div>
        </motion.div>

        {/* ── FRONT-RUN BLOCK ── */}
        <AnimatePresence>
          {showFrontRun && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-full bg-red-950/60 border border-red-500/60 p-4 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h4 className="font-bold text-red-400 text-sm">1. FRONT-RUN (Attacker Buy)</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Buy {attackResult.step1FrontRun.attackerEthGained.toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Price: ${attackResult.priceBeforeAttack.toFixed(2)} → ${attackResult.priceAfterFrontRun.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-red-900/80 text-red-300 px-2 py-1 rounded font-mono">
                    Priority: MAX
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── VICTIM BLOCK ── */}
        <motion.div
          layout
          className={`w-full p-4 rounded-lg border transition-colors duration-500 ${
            showVictimExecuted
              ? "bg-blue-950/40 border-blue-500/30"
              : "bg-slate-800/80 border-slate-600/50"
          }`}
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${showVictimExecuted ? "bg-blue-500" : "bg-slate-400 animate-pulse"}`} />
                <h4 className={`font-bold text-sm ${showVictimExecuted ? "text-blue-400" : "text-slate-300"}`}>
                  2. TARGET SWAP (Victim)
                </h4>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Swap {victimUsdc.toLocaleString()} USDC for ETH
              </p>
            </div>
            <span className={`text-xs px-2 py-1 rounded font-mono ${
              showVictimExecuted
                ? "bg-blue-900/80 text-blue-300"
                : "bg-slate-700 text-slate-400"
            }`}>
              {showVictimExecuted ? "Executed" : "Pending"}
            </span>
          </div>

          {/* Expected vs actual */}
          <div className="mt-3 space-y-1">
            <div className={`text-xs font-mono flex justify-between ${
              showVictimExecuted ? "text-slate-500 line-through" : "text-green-400"
            }`}>
              <span>Expected:</span>
              <span>{expectedEth.toFixed(4)} ETH</span>
            </div>
            <AnimatePresence>
              {showVictimExecuted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="text-xs font-mono flex justify-between text-red-400"
                >
                  <span>Actual:</span>
                  <span>{attackResult.step2Victim.victimEthReceived.toFixed(4)} ETH</span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {showVictimExecuted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.3 }}
                  className="text-xs bg-red-950/50 rounded p-2 mt-2 text-red-400"
                >
                  Slippage: {attackResult.step2Victim.slippageSuffered.toFixed(2)}% — Lost{" "}
                  {(attackResult.step2Victim.expectedEth - attackResult.step2Victim.victimEthReceived).toFixed(4)} ETH
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── BACK-RUN BLOCK ── */}
        <AnimatePresence>
          {showBackRun && (
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-full bg-red-950/60 border border-red-500/60 p-4 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)]"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <h4 className="font-bold text-red-400 text-sm">3. BACK-RUN (Attacker Sell)</h4>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    Sell {attackResult.step1FrontRun.attackerEthGained.toFixed(4)} ETH
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Receives ${attackResult.step3BackRun.attackerUsdcReturned.toFixed(2)} USDC
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-red-900/80 text-red-300 px-2 py-1 rounded font-mono">
                    Priority: MAX
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROFIT REVEAL ── */}
        <AnimatePresence>
          {showProfit && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
              className="w-full bg-gradient-to-r from-green-950/60 to-red-950/60 border border-green-500/30 rounded-lg p-4 text-center"
            >
              <div className="text-sm text-slate-400 mb-1">Attacker Extracted</div>
              <div className={`text-3xl font-bold font-mono ${
                attackResult.attackerProfitUsdc > 0 ? "text-green-400" : "text-red-400"
              }`}>
                {attackResult.attackerProfitUsdc > 0 ? "+" : ""}${attackResult.attackerProfitUsdc.toFixed(2)}
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Extracted directly from the victim&apos;s slippage tolerance
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom stats */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-3 text-xs font-mono">
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <span className="text-slate-400">Pool: </span>
          <span className="text-white">100 ETH / 200k USDC</span>
        </div>
        <AnimatePresence>
          {showProfit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/60 backdrop-blur border border-red-800/30 px-3 py-2 rounded-lg text-red-400"
            >
              Victim Lost: {attackResult.step2Victim.slippageSuffered.toFixed(2)}%
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
