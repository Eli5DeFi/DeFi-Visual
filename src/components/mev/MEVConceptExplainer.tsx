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
    title: "The Dark Forest (Mempool)",
    icon: "\u{1F332}",
    content: (
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
        <p>
          Before a transaction becomes permanent on the blockchain, it sits in the{" "}
          <strong className="text-white">Mempool</strong> — a public waiting room of pending,
          unconfirmed transactions.
        </p>
        <p>
          Every swap you submit broadcasts its parameters in plain text: input token, output token,
          slippage tolerance. This visibility is what makes MEV extraction possible.
        </p>
        <div className="bg-slate-950 rounded-lg p-3 text-center font-mono text-xs text-red-400">
          Your pending tx is visible to everyone
        </div>
      </div>
    ),
  },
  {
    title: "Searchers (The Predators)",
    icon: "\u{1F916}",
    content: (
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
        <p>
          <strong className="text-white">Searchers</strong> are highly optimized bots that scan
          the Mempool 24/7. When they spot a large, vulnerable AMM trade, they simulate the math,
          calculate profit, and construct a &ldquo;bundle&rdquo; of transactions to exploit it.
        </p>
        <p>
          They use <strong className="text-white">flash loans</strong> — uncollateralized loans that
          must be repaid in the same transaction — meaning they need zero capital to attack.
        </p>
      </div>
    ),
  },
  {
    title: "The Sandwich Attack",
    icon: "\u{1F96A}",
    content: (
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
        <p>Three trades are executed in precise order within one block:</p>
        <div className="space-y-2">
          <div className="bg-red-950/50 border border-red-800/30 rounded p-2">
            <strong className="text-red-400">1. Front-Run:</strong> Attacker buys ETH before you,
            pushing the price up.
          </div>
          <div className="bg-blue-950/50 border border-blue-800/30 rounded p-2">
            <strong className="text-blue-400">2. Your Trade:</strong> Executes at the inflated
            price, pushing it even higher.
          </div>
          <div className="bg-red-950/50 border border-red-800/30 rounded p-2">
            <strong className="text-red-400">3. Back-Run:</strong> Attacker sells at the inflated
            price, pocketing the difference.
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "How to Protect Yourself",
    icon: "\u{1F6E1}\u{FE0F}",
    content: (
      <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
        <ul className="space-y-2 ml-1">
          <li className="text-slate-400">
            <strong className="text-white">Low slippage tolerance:</strong> Set it as low as possible (0.1-0.5%).
            Less room for extraction = less profit for attackers.
          </li>
          <li className="text-slate-400">
            <strong className="text-white">Private mempools:</strong> Services like Flashbots Protect
            send your tx directly to block builders, bypassing the public mempool.
          </li>
          <li className="text-slate-400">
            <strong className="text-white">Smaller trades:</strong> Split large swaps into smaller
            ones to reduce price impact and MEV opportunity.
          </li>
          <li className="text-slate-400">
            <strong className="text-white">MEV-aware DEXs:</strong> Some DEXs (like CoW Swap) batch
            trades to prevent sandwich attacks entirely.
          </li>
        </ul>
      </div>
    ),
  },
]

export default function MEVConceptExplainer() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      {concepts.map((concept, index) => (
        <div
          key={index}
          className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/50"
        >
          <button
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">{concept.icon}</span>
              <span className="font-medium text-white text-sm">{concept.title}</span>
            </div>
            <motion.div
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-slate-400" />
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
