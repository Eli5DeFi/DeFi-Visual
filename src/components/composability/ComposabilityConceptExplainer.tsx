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
    title: "What are Money Legos?",
    icon: "\u{1F9F1}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Money Legos</strong> are DeFi protocols that can be stacked
          and combined like building blocks. Each protocol&apos;s output becomes another&apos;s input,
          creating complex financial strategies from simple primitives.
        </p>
        <p>
          Unlike traditional finance where banks operate in silos, DeFi protocols are permissionlessly
          composable — anyone can plug one into another.
        </p>
        <div className="bg-[#030712] rounded-lg p-3 text-center font-mono text-sm">
          <span className="text-teal-400">ETH</span>
          <span className="text-[#3b6b6b]"> → </span>
          <span className="text-cyan-400">stETH</span>
          <span className="text-[#3b6b6b]"> → </span>
          <span className="text-amber-400">crvLP</span>
          <span className="text-[#3b6b6b]"> → </span>
          <span className="text-emerald-400">cvxLP</span>
        </div>
      </div>
    ),
  },
  {
    title: "Yield Stacking",
    icon: "\u{1F4C8}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Yield stacking</strong> means earning multiple yield sources
          simultaneously. For example, Lido staking yields + Curve LP fees + Convex CRV rewards — all
          from the same ETH.
        </p>
        <div className="space-y-2">
          <div className="bg-teal-950/30 border border-teal-800/30 rounded p-2">
            <strong className="text-teal-400">Layer 1:</strong> ETH staking yield (~3.8% APY)
          </div>
          <div className="bg-amber-950/30 border border-amber-800/30 rounded p-2">
            <strong className="text-amber-400">Layer 2:</strong> + Curve LP trading fees (~5.2% APY)
          </div>
          <div className="bg-emerald-950/30 border border-emerald-800/30 rounded p-2">
            <strong className="text-emerald-400">Layer 3:</strong> + Convex CRV+CVX rewards (~8.5% APY)
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Recursive Leverage",
    icon: "\u{1F504}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Recursive leverage</strong> (or looping) uses lending protocols
          to amplify exposure. You supply an asset, borrow against it, supply the borrowed asset, and
          repeat — creating leveraged yield positions.
        </p>
        <div className="bg-[#030712] rounded-lg p-3 font-mono text-xs space-y-1">
          <div className="flex justify-between"><span className="text-[#6b8a99]">Supply ETH →</span><span className="text-teal-400">Earn 3.2%</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Borrow USDC →</span><span className="text-rose-400">Pay 4.5%</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Supply USDC →</span><span className="text-teal-400">Earn 5.5%</span></div>
          <div className="flex justify-between border-t border-[#132d30] pt-1 mt-1"><span className="text-white">Net yield:</span><span className="text-emerald-400">4.2% on 1.5x capital</span></div>
        </div>
      </div>
    ),
  },
  {
    title: "Composability Risks",
    icon: "\u{26A0}\u{FE0F}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <ul className="space-y-2 ml-1">
          <li>
            <strong className="text-white">Smart contract risk:</strong> Each layer adds another contract
            that could have a bug. Risk compounds multiplicatively, not additively.
          </li>
          <li>
            <strong className="text-white">Liquidation cascades:</strong> Recursive leverage can unwind
            rapidly if collateral drops. One liquidation can trigger a chain reaction.
          </li>
          <li>
            <strong className="text-white">Oracle dependencies:</strong> Stacked protocols often depend
            on the same price feeds. A stale oracle can cause systemic failures.
          </li>
          <li>
            <strong className="text-white">Gas costs:</strong> Complex strategies require multiple
            transactions. On L1, gas can eat into yields significantly.
          </li>
        </ul>
      </div>
    ),
  },
]

export default function ComposabilityConceptExplainer() {
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
