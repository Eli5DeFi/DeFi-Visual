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
    title: "What is an AMM?",
    icon: "🔄",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          An <strong className="text-white">Automated Market Maker (AMM)</strong> is a decentralized
          exchange protocol that uses a mathematical formula to price assets instead of using an order
          book like traditional exchanges.
        </p>
        <p>
          Instead of matching buyers and sellers, AMMs use <strong className="text-white">liquidity pools</strong> —
          smart contracts that hold reserves of two tokens. Anyone can trade against the pool, and
          anyone can provide liquidity to earn fees.
        </p>
      </div>
    ),
  },
  {
    title: "The Constant Product Formula",
    icon: "📐",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <div className="bg-[#030712] rounded-lg p-4 text-center font-mono text-lg text-teal-400">
          x × y = k
        </div>
        <p>
          The core invariant: the product of both token reserves must remain constant. When you buy
          token Y, you add token X to the pool — and since <code className="text-teal-400">k</code>{" "}
          must stay the same, the pool gives you token Y.
        </p>
        <p>
          This creates a <strong className="text-white">hyperbolic curve</strong> that ensures there
          is always liquidity at any price point, though the price changes with each trade.
        </p>
      </div>
    ),
  },
  {
    title: "Impermanent Loss Explained",
    icon: "📉",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Impermanent Loss (IL)</strong> is the difference between
          holding tokens in a liquidity pool vs. simply holding them in your wallet.
        </p>
        <div className="bg-[#030712] rounded-lg p-4 font-mono text-sm text-center">
          <span className="text-amber-400">IL = (2√r / (1+r)) - 1</span>
          <br />
          <span className="text-[#3b6b6b] text-xs">where r = new_price / initial_price</span>
        </div>
        <ul className="space-y-1 ml-4">
          <li className="text-[#6b8a99]">• 1.25x price change → 0.6% loss</li>
          <li className="text-[#6b8a99]">• 1.50x price change → 2.0% loss</li>
          <li className="text-[#6b8a99]">• 2x price change → 5.7% loss</li>
          <li className="text-[#6b8a99]">• 5x price change → 25.5% loss</li>
        </ul>
        <p>
          It&apos;s called &ldquo;impermanent&rdquo; because if the price returns to its original value, the
          loss disappears. But if you withdraw while prices have diverged, the loss becomes permanent.
        </p>
      </div>
    ),
  },
  {
    title: "Price Impact & Slippage",
    icon: "💥",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">Price Impact</strong> measures how much your trade moves the
          pool&apos;s price. Larger trades relative to pool size cause bigger price impacts.
        </p>
        <p>
          This is why <strong className="text-white">deep liquidity</strong> matters — the more
          tokens in the pool, the less each trade affects the price. Try adjusting the swap amount in
          the simulator to see how price impact changes!
        </p>
      </div>
    ),
  },
]

export default function ConceptExplainer() {
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
              <span className="font-medium text-white">{concept.title}</span>
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
