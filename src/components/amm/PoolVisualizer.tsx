"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PoolState } from "@/lib/mathEngine"

interface PoolVisualizerProps {
  pool: PoolState
  initialState: PoolState
  impermanentLoss: number
  totalFeesEarned: number
  swapHistory: Array<{ direction: string; amount: number }>
}

export default function PoolVisualizer({
  pool,
  initialState,
  impermanentLoss,
  totalFeesEarned,
  swapHistory,
}: PoolVisualizerProps) {
  const xRatio = pool.tokenX / initialState.tokenX
  const yRatio = pool.tokenY / initialState.tokenY
  const currentPrice = pool.tokenY / pool.tokenX
  const priceChange =
    ((currentPrice - initialState.initialPrice) / initialState.initialPrice) *
    100

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col items-center justify-center overflow-hidden">
      {/* Background grid effect */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Connection line between tokens */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 800 400"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <motion.path
          d="M 200 200 Q 400 150 600 200"
          stroke="url(#lineGrad)"
          strokeWidth="2"
          fill="none"
          strokeDasharray="8 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {/* K constant label */}
        <text x="400" y="140" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">
          k = {pool.k.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </text>
      </svg>

      {/* Token X (ETH) */}
      <motion.div
        className="absolute left-[15%] sm:left-[20%] flex flex-col items-center"
        animate={{ scale: 0.7 + xRatio * 0.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <motion.div
          className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center cursor-default"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #60a5fa, #3b82f6, #1d4ed8)",
            boxShadow: "0 0 40px rgba(59,130,246,0.4), inset 0 -4px 12px rgba(0,0,0,0.3)",
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold">{pool.tokenX.toFixed(2)}</div>
            <div className="text-sm opacity-80">ETH</div>
          </div>
        </motion.div>
        <motion.div
          className="mt-3 text-xs font-mono text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {xRatio > 1 ? "+" : ""}
          {((xRatio - 1) * 100).toFixed(1)}%
        </motion.div>
      </motion.div>

      {/* Token Y (USDC) */}
      <motion.div
        className="absolute right-[15%] sm:right-[20%] flex flex-col items-center"
        animate={{ scale: 0.7 + yRatio * 0.3 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      >
        <motion.div
          className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full flex items-center justify-center cursor-default"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, #4ade80, #22c55e, #15803d)",
            boxShadow: "0 0 40px rgba(34,197,94,0.4), inset 0 -4px 12px rgba(0,0,0,0.3)",
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold">
              {pool.tokenY >= 1000
                ? (pool.tokenY / 1000).toFixed(1) + "k"
                : pool.tokenY.toFixed(0)}
            </div>
            <div className="text-sm opacity-80">USDC</div>
          </div>
        </motion.div>
        <motion.div
          className="mt-3 text-xs font-mono text-slate-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {yRatio > 1 ? "+" : ""}
          {((yRatio - 1) * 100).toFixed(1)}%
        </motion.div>
      </motion.div>

      {/* Swap animation particles */}
      <AnimatePresence>
        {swapHistory.length > 0 && (
          <motion.div
            key={swapHistory.length}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background:
                swapHistory[swapHistory.length - 1].direction === "x-to-y"
                  ? "#3b82f6"
                  : "#22c55e",
            }}
            initial={{
              x: swapHistory[swapHistory.length - 1].direction === "x-to-y" ? -150 : 150,
              y: 0,
              opacity: 1,
              scale: 1.5,
            }}
            animate={{
              x: swapHistory[swapHistory.length - 1].direction === "x-to-y" ? 150 : -150,
              y: [0, -30, 0],
              opacity: 0,
              scale: 0.3,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Stats bar at bottom */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap justify-center gap-4 text-xs font-mono">
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <span className="text-slate-400">Price: </span>
          <span className="text-white">${currentPrice.toFixed(2)}</span>
          <span className={priceChange >= 0 ? "text-green-400 ml-1" : "text-red-400 ml-1"}>
            ({priceChange >= 0 ? "+" : ""}{priceChange.toFixed(1)}%)
          </span>
        </div>
        <AnimatePresence>
          {Math.abs(impermanentLoss) > 0.01 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-950/60 backdrop-blur border border-red-800/30 px-3 py-2 rounded-lg text-red-400"
            >
              IL: {impermanentLoss.toFixed(3)}%
            </motion.div>
          )}
        </AnimatePresence>
        {totalFeesEarned > 0 && (
          <div className="bg-green-950/60 backdrop-blur border border-green-800/30 px-3 py-2 rounded-lg text-green-400">
            Fees: ${totalFeesEarned.toFixed(2)}
          </div>
        )}
        <div className="bg-slate-800/80 backdrop-blur px-3 py-2 rounded-lg">
          <span className="text-slate-400">Swaps: </span>
          <span className="text-white">{swapHistory.length}</span>
        </div>
      </div>
    </div>
  )
}
