"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AMMSimulator from "@/components/amm/AMMSimulator"
import MEVSimulator from "@/components/mev/MEVSimulator"
import FlashLoanSimulator from "@/components/flashloan/FlashLoanSimulator"

/* ── Tab definitions ── */
const TABS = [
  {
    id: "amm",
    label: "AMMs & IL",
    fullLabel: "Automated Market Makers",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M8 5v3l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    badge: "LIVE",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-900/60",
    description: "Constant product curves, swaps & impermanent loss",
  },
  {
    id: "mev",
    label: "MEV Attacks",
    fullLabel: "Sandwich Attacks",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M8 2L3 7h3v5h4V7h3L8 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    badge: "LIVE",
    badgeColor: "text-rose-400 bg-rose-950/60 border-rose-900/60",
    description: "Front-run, victim swap, back-run — MEV extracted",
  },
  {
    id: "flashloan",
    label: "Flash Loans",
    fullLabel: "Flash Loan Arbitrage",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M9 2L5 9h4.5L7 14l6-8H8.5L9 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
    badge: "NEW",
    badgeColor: "text-indigo-400 bg-indigo-950/60 border-indigo-900/60",
    description: "Zero-collateral loans, arbitrage & atomic execution",
  },
] as const

type TabId = (typeof TABS)[number]["id"]

/* ── Stat cards in hero ── */
const HERO_STATS = [
  { label: "Flash Loan Fee", value: "0.09%", sub: "Aave Protocol" },
  { label: "AMM Fee", value: "0.30%", sub: "Standard Pool" },
  { label: "MEV Extracted", value: "$1.3B+", sub: "All-time Ethereum" },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("amm")

  return (
    <div className="min-h-screen bg-[#05050f] text-[#e8eaf6]">
      {/* ── Hero header ── */}
      <header className="relative overflow-hidden border-b border-[#1a1a35]">
        {/* Grid background */}
        <div className="absolute inset-0 grid-bg opacity-60" />

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2
            bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 translate-x-1/2 -translate-y-1/2
            bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 -translate-x-1/2 translate-y-1/2
            bg-cyan-600/8 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                bg-indigo-950/60 border border-indigo-800/40 text-indigo-400 text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Interactive DeFi Education — Real Math, Real Results
              </div>
            </div>

            {/* Title */}
            <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="gradient-text">DeFi Visual</span>
            </h1>
            <p className="mt-4 text-center text-lg sm:text-xl text-[#7986a8] max-w-2xl mx-auto leading-relaxed">
              Master DeFi primitives through interactive simulations.
              AMMs, MEV sandwich attacks, and flash loan arbitrage — all powered by real protocol math.
            </p>

            {/* Stats row */}
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              {HERO_STATS.map(({ label, value, sub }) => (
                <div key={label} className="text-center px-6 py-3 rounded-xl
                  bg-[#0a0a1a]/60 border border-[#1a1a35] backdrop-blur">
                  <div className="text-2xl font-mono font-bold gradient-text">{value}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{label}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Custom tab navigation */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 p-1.5
            bg-[#0a0a1a] border border-[#1a1a35] rounded-2xl">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex-1 flex items-center gap-3 px-4 py-3 rounded-xl
                    text-left transition-all duration-200 group
                    ${isActive
                      ? "bg-[#111128] border border-indigo-900/40 shadow-lg shadow-indigo-950/30"
                      : "hover:bg-[#0d0d20] border border-transparent"
                    }`}
                >
                  {/* Active glow */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-indigo-600/5 pointer-events-none" />
                  )}

                  {/* Icon */}
                  <div className={`shrink-0 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-400"
                  }`}>
                    {tab.icon}
                  </div>

                  {/* Labels */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-semibold transition-colors ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-300"
                      }`}>
                        {tab.label}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${tab.badgeColor}`}>
                        {tab.badge}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 truncate hidden sm:block mt-0.5">
                      {tab.description}
                    </div>
                  </div>

                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === "amm" && <AMMSimulator />}
            {activeTab === "mev" && <MEVSimulator />}
            {activeTab === "flashloan" && <FlashLoanSimulator />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1a1a35] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="text-sm text-slate-500">Built by</div>
              <a
                href="https://x.com/Eli5defi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold
                  text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                @Eli5DeFi
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.75 3.75a.75.75 0 0 0-1.5 0v3.5h-3.5a.75.75 0 0 0 0 1.5h3.5v3.5a.75.75 0 0 0 1.5 0v-3.5h3.5a.75.75 0 0 0 0-1.5h-3.5v-3.5z"/>
                </svg>
              </a>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>Educational tool — not financial advice</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span>Real protocol math</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span>No wallet needed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
