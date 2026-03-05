"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AMMSimulator from "@/components/amm/AMMSimulator"
import MEVSimulator from "@/components/mev/MEVSimulator"
import FlashLoanSimulator from "@/components/flashloan/FlashLoanSimulator"
import PendleSimulator from "@/components/pendle/PendleSimulator"

/* ── Tab definitions ── */
const TABS = [
  {
    id: "amm",
    label: "AMMs & IL",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M5 8.5C6 6 10 6 11 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
    badge: "CORE",
    badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-900/50",
    accent: "#06b6d4",
  },
  {
    id: "mev",
    label: "MEV Attacks",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M3 12l3-4 2.5 2L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="13" cy="4" r="1.5" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
    badge: "LIVE",
    badgeColor: "text-rose-400 bg-rose-950/60 border-rose-900/50",
    accent: "#f43f5e",
  },
  {
    id: "flashloan",
    label: "Flash Loans",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M9 2L5 9h4l-1 5 5-7H9l1-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    badge: "NEW",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-900/50",
    accent: "#f59e0b",
  },
  {
    id: "pendle",
    label: "Pendle PT/YT",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
        <path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    badge: "NEW",
    badgeColor: "text-violet-400 bg-violet-950/60 border-violet-900/50",
    accent: "#8b5cf6",
  },
] as const

type TabId = (typeof TABS)[number]["id"]

/* ── Animation variants ── */
const heroVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const statVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

/* ── Hero stats ── */
const HERO_STATS = [
  { label: "Flash Loan Fee", value: "0.09%", sub: "Aave v3" },
  { label: "AMM Fee", value: "0.30%", sub: "Uniswap v2" },
  { label: "MEV Extracted", value: "$1.3B+", sub: "All-time ETH" },
  { label: "Pendle TVL", value: "$4B+", sub: "Yield Markets" },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("amm")
  const activeTabData = TABS.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-[#05050f] text-[#e8eaf6]">
      {/* ── Hero ── */}
      <header className="relative overflow-hidden border-b border-[#12122a]">
        {/* Grid */}
        <div className="absolute inset-0 grid-bg" />

        {/* Glow orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-[100px] glow-orb" />
          <div className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-violet-600/8 rounded-full blur-[100px] glow-orb-delayed" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-600/5 rounded-full blur-[80px]" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[
            { left: "15%", bottom: "10%", delay: "0s", size: 3 },
            { left: "30%", bottom: "20%", delay: "2s", size: 2 },
            { left: "55%", bottom: "5%", delay: "4s", size: 2 },
            { left: "75%", bottom: "15%", delay: "1s", size: 3 },
            { left: "85%", bottom: "25%", delay: "5s", size: 2 },
          ].map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-indigo-400/40 particle"
              style={{ left: p.left, bottom: p.bottom, width: p.size, height: p.size, animationDelay: p.delay }}
            />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <motion.div variants={heroVariants} initial="hidden" animate="visible">
            {/* Badge */}
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full
                glass-card text-xs font-medium tracking-wide text-indigo-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-400" />
                </span>
                Interactive DeFi Education — Real Protocol Math
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1 variants={itemVariants} className="text-center">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-text leading-tight">
                DeFi Visual
              </span>
            </motion.h1>

            <motion.p variants={itemVariants}
              className="mt-5 text-center text-base sm:text-lg text-[#7986a8] max-w-xl mx-auto leading-relaxed">
              Master DeFi primitives through interactive simulations.
              AMMs, MEV, flash loans, and yield tokenization — all powered by the real math.
            </motion.p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {HERO_STATS.map(({ label, value, sub }, i) => (
                <motion.div
                  key={label}
                  custom={i}
                  variants={statVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.04, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="glass-card rounded-xl px-4 py-3 text-center cursor-default
                    hover:border-indigo-800/30 transition-colors"
                >
                  <div className="text-xl sm:text-2xl font-mono font-bold gradient-text">{value}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{label}</div>
                  <div className="text-[10px] text-slate-600">{sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab navigation */}
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex gap-1.5 p-1.5 glass-card rounded-2xl">
            {TABS.map(tab => {
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ scale: isActive ? 1 : 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl
                    text-sm font-medium transition-colors duration-150 cursor-pointer
                    ${isActive
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-300"
                    }`}
                >
                  {/* Active background with animated border */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl bg-[#111128] border border-indigo-800/30 animated-border tab-glow-enter"
                      style={{ boxShadow: `0 0 24px ${tab.accent}15, 0 0 48px ${tab.accent}08` }}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Content */}
                  <span className="relative z-10 flex items-center gap-2">
                    <span style={{ color: isActive ? tab.accent : undefined }}>{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border leading-none
                      ${isActive ? tab.badgeColor : "text-slate-600 bg-slate-900/50 border-slate-800"}`}>
                      {tab.badge}
                    </span>
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.nav>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "amm" && <AMMSimulator />}
            {activeTab === "mev" && <MEVSimulator />}
            {activeTab === "flashloan" && <FlashLoanSimulator />}
            {activeTab === "pendle" && <PendleSimulator />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#12122a] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-600">Built by</span>
              <a
                href="https://x.com/Eli5defi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                @Eli5DeFi
              </a>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-slate-600">
              <span>Educational tool</span>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <span>Real protocol math</span>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <span>No wallet needed</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
