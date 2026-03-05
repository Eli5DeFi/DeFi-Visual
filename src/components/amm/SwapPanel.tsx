"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { SwapResult } from "@/lib/mathEngine"

interface SwapPanelProps {
  preview: SwapResult
  swapAmount: number
  setSwapAmount: (v: number) => void
  direction: "x-to-y" | "y-to-x"
  setDirection: (d: "x-to-y" | "y-to-x") => void
  onSwap: () => void
  onReset: () => void
  maxAmountX: number
  maxAmountY: number
  feeRate: number
  setFeeRate: (v: number) => void
}

export default function SwapPanel({
  preview,
  swapAmount,
  setSwapAmount,
  direction,
  setDirection,
  onSwap,
  onReset,
  maxAmountX,
  maxAmountY,
  feeRate,
  setFeeRate,
}: SwapPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const isXtoY = direction === "x-to-y"
  const fromToken = isXtoY ? "ETH" : "USDC"
  const toToken = isXtoY ? "USDC" : "ETH"
  const maxAmount = isXtoY ? maxAmountX : maxAmountY
  const step = isXtoY ? 0.1 : 100

  return (
    <div className="space-y-5">
      {/* Direction toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Simulate Swap</h3>
        <Button
          variant="outline"
          size="sm"
          aria-label="Toggle swap direction"
          onClick={() => {
            setDirection(isXtoY ? "y-to-x" : "x-to-y")
            setSwapAmount(isXtoY ? 500 : 1)
          }}
          className="gap-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          {fromToken} → {toToken}
        </Button>
      </div>

      {/* Amount slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#6b8a99]">{fromToken} Amount</span>
          <span className="font-mono text-white text-lg">
            {swapAmount.toFixed(isXtoY ? 1 : 0)} {fromToken}
          </span>
        </div>
        <Slider
          value={[swapAmount]}
          max={maxAmount}
          min={step}
          step={step}
          onValueChange={(val) => setSwapAmount(val[0])}
        />
        {/* Quick amount buttons */}
        <div className="flex gap-2">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              onClick={() => setSwapAmount(Math.max(step, maxAmount * pct))}
              className="flex-1 text-xs py-1.5 rounded-md bg-[#0f1d24] hover:bg-[#132d30] text-[#a7d3c0] transition-colors"
            >
              {pct * 100}%
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <motion.div
        className="bg-[#030712]/80 border border-[#132d30] rounded-lg p-4 space-y-2"
        initial={false}
        animate={{ borderColor: preview.priceImpact > 5 ? "#dc2626" : "#132d30" }}
      >
        <div className="flex justify-between text-sm">
          <span className="text-[#6b8a99]">Expected Output</span>
          <span className="text-white font-mono">
            +{isXtoY ? preview.amountOut.toFixed(2) : preview.amountOut.toFixed(6)} {toToken}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6b8a99]">Price Impact</span>
          <span
            className={
              preview.priceImpact > 5
                ? "text-rose-400 font-mono"
                : preview.priceImpact > 1
                ? "text-amber-400 font-mono"
                : "text-emerald-400 font-mono"
            }
          >
            {preview.priceImpact.toFixed(3)}%
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6b8a99]">New Price</span>
          <span className="text-white font-mono">
            ${preview.newPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6b8a99]">Fee ({(feeRate * 100).toFixed(1)}%)</span>
          <span className="text-emerald-400 font-mono">
            ${preview.feeEarned.toFixed(2)}
          </span>
        </div>

        {preview.priceImpact > 5 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="text-xs text-rose-400 bg-rose-950/40 rounded p-2 mt-2"
          >
            High price impact! This trade moves the price significantly.
          </motion.div>
        )}
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
        <Button onClick={onSwap} className="flex-1 bg-teal-600 hover:bg-teal-500 h-12 text-base">
          Execute Swap
        </Button>
        <Button onClick={onReset} variant="outline" className="h-12">
          Reset
        </Button>
      </div>
    </div>
  )
}
