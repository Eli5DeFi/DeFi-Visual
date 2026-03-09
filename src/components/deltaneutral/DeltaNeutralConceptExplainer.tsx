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
    title: "What is Delta Neutral?",
    icon: "\u2696\uFE0F",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          A <strong className="text-white">delta-neutral strategy</strong> eliminates directional
          price exposure by combining offsetting positions. In crypto, this typically means holding
          spot ETH <strong className="text-teal-400">long</strong> while simultaneously opening an
          equal-sized <strong className="text-rose-400">short perpetual</strong> position.
        </p>
        <p>
          The portfolio&apos;s <strong className="text-white">delta</strong> (sensitivity to price) is zero:
          if ETH goes up $100, the spot gains $100 but the short loses $100. Net effect = $0.
        </p>
        <div className="bg-[#030712] rounded-lg p-3 text-center font-mono text-sm">
          <span className="text-teal-400">+1 spot</span>{" "}
          <span className="text-[#6b8a99]">+</span>{" "}
          <span className="text-rose-400">-1 perp</span>{" "}
          <span className="text-[#6b8a99]">=</span>{" "}
          <span className="text-amber-400">0 delta</span>
        </div>
      </div>
    ),
  },
  {
    title: "Cash-and-Carry Yield",
    icon: "\uD83D\uDCB0",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          The yield source is <strong className="text-white">funding rate payments</strong>.
          In bullish markets, perpetual prices trade above spot, so longs pay shorts every 8 hours.
          Your short perp <strong className="text-teal-400">collects</strong> this funding.
        </p>
        <div className="space-y-2">
          <div className="bg-teal-950/30 border border-teal-800/30 rounded p-2">
            <strong className="text-teal-400">Example:</strong> $100k position, 0.01% per 8h
            = $10 per period = $30/day = <strong className="text-white">$10,950/year (10.95% APY)</strong>
          </div>
          <div className="bg-[#030712] rounded-lg p-3 font-mono text-xs">
            <div>Annual Yield = Funding Rate &times; 3 &times; 365</div>
            <div className="text-amber-400 mt-1">= 0.01% &times; 3 &times; 365 = 10.95%</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Ethena USDe: DN Stablecoin",
    icon: "\uD83C\uDFE6",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Ethena&apos;s USDe</strong> is a synthetic dollar backed by a
          delta-neutral position. Users deposit ETH/stETH as collateral, and Ethena opens an
          equivalent short perpetual hedge on centralized exchanges.
        </p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">1</div>
            <span>User deposits 1 ETH ($2,000) to mint 2,000 USDe</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">2</div>
            <span>Ethena stakes ETH as stETH (earns staking yield ~3-4%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">3</div>
            <span>Opens -1 ETH short perp (hedges price exposure)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-[10px]">4</div>
            <span>Collects funding rate payments as yield for sUSDe holders</span>
          </div>
        </div>
        <div className="bg-amber-950/30 border border-amber-800/30 rounded p-2 text-xs">
          <strong className="text-amber-400">sUSDe yield</strong> = staking yield + funding income - reserve allocation
        </div>
      </div>
    ),
  },
  {
    title: "Risks & Edge Cases",
    icon: "\u26A0\uFE0F",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <ul className="space-y-2 ml-1">
          <li>
            <strong className="text-rose-400">Negative funding:</strong> In bear markets, shorts pay
            longs. Your DN position <em>loses</em> money from funding. Ethena uses a reserve fund to
            absorb periods of negative funding.
          </li>
          <li>
            <strong className="text-rose-400">Liquidation risk:</strong> If ETH spikes fast enough,
            the short perp can get liquidated before rebalancing. Higher leverage = tighter liquidation.
          </li>
          <li>
            <strong className="text-rose-400">Exchange risk:</strong> Ethena holds positions on CEXes
            (Binance, Bybit, OKX). Exchange failure = loss of hedge.
          </li>
          <li>
            <strong className="text-rose-400">Smart contract risk:</strong> Minting/redemption
            contracts, custody solutions (Copper, Ceffu) add attack surface.
          </li>
          <li>
            <strong className="text-amber-400">Depeg risk:</strong> If market loses confidence,
            USDe can trade below $1 even if backing is sound (reflexive selling).
          </li>
        </ul>
      </div>
    ),
  },
]

export default function DeltaNeutralConceptExplainer() {
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
