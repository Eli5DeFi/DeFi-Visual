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
    title: "What are Funding Rates?",
    icon: "\u{1F4B8}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Funding rates</strong> are periodic payments exchanged between
          long and short traders in perpetual futures contracts. They keep the perp price anchored to the spot price.
        </p>
        <p>
          When funding is <strong className="text-teal-400">positive</strong>, longs pay shorts — this happens
          when the perp trades above spot (bullish sentiment). When <strong className="text-rose-400">negative</strong>,
          shorts pay longs (bearish sentiment).
        </p>
        <div className="bg-[#030712] rounded-lg p-3 text-center font-mono text-sm">
          <span className="text-teal-400">Rate &gt; 0</span> → Longs pay shorts<br/>
          <span className="text-rose-400">Rate &lt; 0</span> → Shorts pay longs
        </div>
      </div>
    ),
  },
  {
    title: "Open Interest (OI)",
    icon: "\u{1F4CA}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Open Interest</strong> is the total value of all outstanding
          derivative contracts that have not been settled. It measures how much money is actively
          positioned in the market.
        </p>
        <p>
          Rising OI with rising price = new longs entering (bullish).
          Rising OI with falling price = new shorts entering (bearish).
          Falling OI = positions closing.
        </p>
        <div className="bg-[#030712] rounded-lg p-3 font-mono text-xs space-y-1">
          <div className="flex justify-between"><span className="text-[#6b8a99]">Long OI &gt; Short OI:</span><span className="text-teal-400">Positive funding</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Short OI &gt; Long OI:</span><span className="text-rose-400">Negative funding</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Balanced OI:</span><span className="text-amber-400">Near-zero funding</span></div>
        </div>
      </div>
    ),
  },
  {
    title: "Funding Rate Impact on Positions",
    icon: "\u{1F4A1}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          Funding payments are proportional to your position size, not your margin. A $100k position
          with 10x leverage pays funding on the full $100k, even though you only deposited $10k.
        </p>
        <div className="space-y-2">
          <div className="bg-teal-950/30 border border-teal-800/30 rounded p-2">
            <strong className="text-teal-400">At 0.01% per 8h:</strong> $100k position pays $10/period = $30/day = $10,950/year
          </div>
          <div className="bg-rose-950/30 border border-rose-800/30 rounded p-2">
            <strong className="text-rose-400">At 0.1% per 8h:</strong> $100k position pays $100/period = $300/day = $109,500/year
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Funding Rate Strategies",
    icon: "\u{1F3AF}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <ul className="space-y-2 ml-1">
          <li>
            <strong className="text-white">Cash-and-carry:</strong> Go long spot + short perp to collect
            positive funding while being delta neutral.
          </li>
          <li>
            <strong className="text-white">Funding rate arbitrage:</strong> Trade funding rate differences
            across exchanges.
          </li>
          <li>
            <strong className="text-white">Sentiment indicator:</strong> Extreme positive funding often
            precedes liquidation cascades. Negative funding can signal bottoms.
          </li>
          <li>
            <strong className="text-white">Position timing:</strong> Enter longs during negative funding
            (you get paid) and shorts during positive funding (you get paid).
          </li>
        </ul>
      </div>
    ),
  },
]

export default function FundingConceptExplainer() {
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
