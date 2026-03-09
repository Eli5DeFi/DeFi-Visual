"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface ConceptSection {
  title: string
  icon: string
  content: React.ReactNode
}

const concepts: ConceptSection[] = [
  {
    title: "The StableSwap Invariant",
    icon: "\u{1F4D0}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          Curve&apos;s <strong className="text-white">StableSwap</strong> invariant blends two AMM models:
          the <strong className="text-amber-400">constant-sum</strong> (x + y = D, zero slippage)
          and the <strong className="text-rose-400">constant-product</strong> (xy = k, infinite liquidity).
        </p>
        <div className="bg-[#030712] rounded-lg p-4 text-center font-mono text-sm leading-relaxed">
          <div className="text-teal-400">
            A&middot;n<sup>n</sup>&middot;&Sigma;x<sub>i</sub> + D = A&middot;n<sup>n</sup>&middot;D + D<sup>n+1</sup> / (n<sup>n</sup>&middot;&Pi;x<sub>i</sub>)
          </div>
          <div className="text-[#3b6b6b] text-xs mt-2">
            For 2 tokens: 4A(x+y) + D = 4AD + D&sup3;/(4xy)
          </div>
        </div>
        <p>
          Near equilibrium (x &asymp; y), the curve behaves like constant-sum with near-zero slippage.
          As the pool becomes imbalanced, it gracefully degrades to constant-product behavior,
          ensuring liquidity is never fully depleted.
        </p>
      </div>
    ),
  },
  {
    title: "Amplification Coefficient (A)",
    icon: "\u{1F50D}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          The <strong className="text-white">amplification coefficient A</strong> controls how
          &ldquo;flat&rdquo; the curve is around the equilibrium point. Think of it as a
          liquidity concentration dial:
        </p>
        <div className="bg-[#030712] rounded-lg p-3 font-mono text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-rose-400">A = 1</span>
            <span className="text-[#6b8a99]">&asymp; constant-product (high slippage)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-400">A = 10</span>
            <span className="text-[#6b8a99]">moderate flattening</span>
          </div>
          <div className="flex justify-between">
            <span className="text-teal-400">A = 100</span>
            <span className="text-[#6b8a99]">very flat near peg (typical for stables)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cyan-400">A = 1000</span>
            <span className="text-[#6b8a99]">&asymp; constant-sum (near-zero slippage)</span>
          </div>
        </div>
        <p>
          Curve&apos;s 3pool (USDC/USDT/DAI) uses <strong className="text-white">A = 2000</strong>,
          while stETH/ETH uses <strong className="text-white">A = 30</strong> since it carries more
          depeg risk.
        </p>
      </div>
    ),
  },
  {
    title: "Newton&apos;s Method (How Swaps Work)",
    icon: "\u{2699}\u{FE0F}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          Unlike Uniswap&apos;s simple <code className="text-teal-400">y = k/x</code>, the StableSwap
          invariant cannot be solved algebraically. Curve uses <strong className="text-white">Newton&apos;s
          method</strong> to numerically solve for the output amount:
        </p>
        <div className="bg-[#030712] rounded-lg p-3 font-mono text-xs space-y-2">
          <div className="text-[#6b8a99]">// Solving for y given new x:</div>
          <div className="text-cyan-400">y<sub>k+1</sub> = (y<sub>k</sub>&sup2; + c) / (2y<sub>k</sub> + b - D)</div>
          <div className="text-[#3b6b6b] mt-1">where b = S&apos; + D/(A&middot;n), c = D<sup>n+1</sup>/(n<sup>n</sup>&middot;P&apos;&middot;A&middot;n)</div>
        </div>
        <p>
          This converges in ~5-15 iterations on-chain, using only integer arithmetic. The swap
          output is simply: <code className="text-teal-400">dy = y_before - y_after</code>.
        </p>
      </div>
    ),
  },
  {
    title: "Why Stablecoins Need Special AMMs",
    icon: "\u{1F4B1}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          Stablecoins trade at near-1:1 ratios. A constant-product AMM like Uniswap wastes
          most liquidity across prices that will never be reached (e.g., 1 USDC = 10 USDT).
        </p>
        <div className="space-y-2">
          <div className="bg-rose-950/30 border border-rose-800/30 rounded p-2">
            <strong className="text-rose-400">Uniswap:</strong> $1M swap in a $10M USDC/USDT pool
            &rarr; <strong>~10% slippage</strong>
          </div>
          <div className="bg-teal-950/30 border border-teal-800/30 rounded p-2">
            <strong className="text-teal-400">Curve (A=100):</strong> Same swap, same pool
            &rarr; <strong>~0.01% slippage</strong>
          </div>
        </div>
        <p className="text-xs text-[#3b6b6b]">
          This is why Curve dominates stablecoin trading — it concentrates liquidity exactly
          where it&apos;s needed.
        </p>
      </div>
    ),
  },
]

export default function StableSwapConceptExplainer() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {concepts.map((concept, index) => (
        <div
          key={index}
          className="border border-[#132d30] rounded-xl overflow-hidden bg-[#071115]/50"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            className="w-full flex items-center justify-between p-4 hover:bg-[#0f1d24]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{concept.icon}</span>
              <span className="font-medium text-white text-sm">{concept.title}</span>
            </div>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-[#6b8a99]" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="px-4 pb-4">{concept.content}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
