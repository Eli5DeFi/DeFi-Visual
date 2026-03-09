"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import AMMSimulator from "@/components/amm/AMMSimulator"
import MEVSimulator from "@/components/mev/MEVSimulator"
import FlashLoanSimulator from "@/components/flashloan/FlashLoanSimulator"
import PendleSimulator from "@/components/pendle/PendleSimulator"
import APYSimulator from "@/components/apy/APYSimulator"
import FundingRateSimulator from "@/components/funding/FundingRateSimulator"
import ComposabilitySimulator from "@/components/composability/ComposabilitySimulator"
import StableSwapSimulator from "@/components/stableswap/StableSwapSimulator"
import DeltaNeutralSimulator from "@/components/deltaneutral/DeltaNeutralSimulator"

/* ── Tabs ── */
const TABS = [
  {
    id: "amm",
    label: "AMMs & IL",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5 8.5C6 6 10 6 11 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    badge: "CORE",
    badgeColor: "text-teal-400 bg-teal-950/60 border-teal-900/50",
    accent: "#14b8a6",
  },
  {
    id: "stableswap",
    label: "Curve StableSwap",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M2 12C4 12 5 4 8 4S12 12 14 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="8" cy="4" r="1.5" fill="currentColor" opacity="0.4"/></svg>,
    badge: "NEW",
    badgeColor: "text-teal-400 bg-teal-950/60 border-teal-900/50",
    accent: "#14b8a6",
  },
  {
    id: "mev",
    label: "MEV Attacks",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M3 12l3-4 2.5 2L13 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="13" cy="4" r="1.5" fill="currentColor" opacity="0.5"/></svg>,
    badge: "LIVE",
    badgeColor: "text-rose-400 bg-rose-950/60 border-rose-900/50",
    accent: "#f43f5e",
  },
  {
    id: "flashloan",
    label: "Flash Loans",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M9 2L5 9h4l-1 5 5-7H9l1-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
    badge: "NEW",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-900/50",
    accent: "#f59e0b",
  },
  {
    id: "pendle",
    label: "Pendle PT/YT",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M8 2v12M4 6l4-4 4 4M4 10l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    badge: "NEW",
    badgeColor: "text-cyan-400 bg-cyan-950/60 border-cyan-900/50",
    accent: "#22d3ee",
  },
  {
    id: "apy",
    label: "APY Calculator",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M2 14V8l3-2v8M7 14V5l3-3v12M12 14V7l2-1v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    badge: "NEW",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-900/50",
    accent: "#22c55e",
  },
  {
    id: "funding",
    label: "Funding & OI",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="4" cy="5" r="1.5" stroke="currentColor" strokeWidth="1.2"/><circle cx="12" cy="11" r="1.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
    badge: "NEW",
    badgeColor: "text-purple-400 bg-purple-950/60 border-purple-900/50",
    accent: "#a855f7",
  },
  {
    id: "deltaneutral",
    label: "Delta Neutral",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><path d="M8 2L3 13h10L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 9h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>,
    badge: "NEW",
    badgeColor: "text-indigo-400 bg-indigo-950/60 border-indigo-900/50",
    accent: "#818cf8",
  },
  {
    id: "composability",
    label: "Money Legos",
    icon: <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none"><rect x="2" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="9" y="9" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/><rect x="5.5" y="2" width="5" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.2"/></svg>,
    badge: "NEW",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-900/50",
    accent: "#f59e0b",
  },
] as const

type TabId = (typeof TABS)[number]["id"]

/* ── Variants ── */
const heroVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
}
const statVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 12 },
  visible: (i: number) => ({
    opacity: 1, scale: 1, y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
}

const HERO_STATS = [
  { label: "Flash Loan Fee", value: "0.09%", sub: "Aave v3" },
  { label: "AMM Fee", value: "0.30%", sub: "Uniswap v2" },
  { label: "MEV Extracted", value: "$1.3B+", sub: "All-time ETH" },
  { label: "Pendle TVL", value: "$4B+", sub: "Yield Markets" },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>("amm")
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const activeTabData = TABS.find(t => t.id === activeTab)!

  return (
    <div className="min-h-screen bg-[#030712] text-[#f0fdf4]">
      <header className="relative overflow-hidden border-b border-[#132d30]">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] bg-teal-600/6 rounded-full blur-[100px] glow-orb" />
          <div className="absolute -top-32 right-1/4 w-[400px] h-[400px] bg-cyan-600/6 rounded-full blur-[100px] glow-orb-delayed" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-600/4 rounded-full blur-[80px]" />
        </div>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[{ left: "15%", bottom: "10%", delay: "0s", size: 3 }, { left: "30%", bottom: "20%", delay: "2s", size: 2 },
            { left: "55%", bottom: "5%", delay: "4s", size: 2 }, { left: "75%", bottom: "15%", delay: "1s", size: 3 },
            { left: "85%", bottom: "25%", delay: "5s", size: 2 }].map((p, i) => (
            <div key={i} className="absolute rounded-full bg-teal-400/30 particle"
              style={{ left: p.left, bottom: p.bottom, width: p.size, height: p.size, animationDelay: p.delay }} />
          ))}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <motion.div variants={heroVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-card text-xs font-medium tracking-wide text-teal-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
                </span>
                Interactive DeFi Education — Real Protocol Math
              </div>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-center">
              <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight gradient-text leading-tight">DeFi Visual</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-5 text-center text-base sm:text-lg text-[#6b8a99] max-w-xl mx-auto leading-relaxed">
              Master DeFi primitives through interactive simulations. AMMs, MEV, flash loans, and yield tokenization — all powered by the real math.
            </motion.p>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              {HERO_STATS.map(({ label, value, sub }, i) => (
                <motion.div key={label} custom={i} variants={statVariants} initial="hidden" animate="visible"
                  whileHover={{ scale: 1.04, y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="glass-card rounded-xl px-4 py-3 text-center cursor-default hover:border-teal-800/30 transition-colors">
                  <div className="text-xl sm:text-2xl font-mono font-bold gradient-text">{value}</div>
                  <div className="text-[11px] text-[#6b8a99] mt-1">{label}</div>
                  <div className="text-[10px] text-[#3b6b6b]">{sub}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* ── Main content area ── */}
          <main className="flex-1 min-w-0">
            {/* Mobile: horizontal scroll tabs (visible below lg) */}
            <motion.nav initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }} className="mb-6 lg:hidden" role="navigation" aria-label="Simulator tabs (mobile)">
              <div className="flex gap-1.5 p-1.5 glass-card rounded-2xl overflow-x-auto" role="tablist">
                {TABS.map(tab => {
                  const isActive = activeTab === tab.id
                  return (
                    <motion.button key={tab.id} role="tab" aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-2 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${isActive ? "text-white" : "text-[#6b8a99] hover:text-[#d1fae5]"}`}>
                      {isActive && (
                        <motion.div layoutId="activeTabMobile"
                          className="absolute inset-0 rounded-xl bg-[#0f1d24] border border-teal-800/25"
                          style={{ boxShadow: `0 0 24px ${tab.accent}12, 0 0 48px ${tab.accent}06` }}
                          transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span style={{ color: isActive ? tab.accent : undefined }}>{tab.icon}</span>
                        <span className="text-xs">{tab.label}</span>
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.nav>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }}>
                {activeTab === "amm" && <AMMSimulator />}
                {activeTab === "stableswap" && <StableSwapSimulator />}
                {activeTab === "mev" && <MEVSimulator />}
                {activeTab === "flashloan" && <FlashLoanSimulator />}
                {activeTab === "pendle" && <PendleSimulator />}
                {activeTab === "apy" && <APYSimulator />}
                {activeTab === "funding" && <FundingRateSimulator />}
                {activeTab === "deltaneutral" && <DeltaNeutralSimulator />}
                {activeTab === "composability" && <ComposabilitySimulator />}
              </motion.div>
            </AnimatePresence>
          </main>

          {/* ── Collapsible right sidebar (desktop only) ── */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="hidden lg:block relative flex-shrink-0"
            aria-label="Simulator navigation"
          >
            <div className="sticky top-8">
              {/* Toggle button */}
              <button
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label={sidebarOpen ? "Collapse navigation sidebar" : "Expand navigation sidebar"}
                className="absolute -left-3 top-6 z-20 w-6 h-6 rounded-full bg-[#0f1d24] border border-[#132d30] flex items-center justify-center text-[#6b8a99] hover:text-teal-400 hover:border-teal-800/40 transition-colors"
              >
                {sidebarOpen ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              </button>

              <motion.div
                animate={{ width: sidebarOpen ? 220 : 52 }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
                className="overflow-hidden"
              >
                <nav className="glass-card rounded-2xl p-2 space-y-1" role="tablist" aria-label="Simulator tabs">
                  {TABS.map(tab => {
                    const isActive = activeTab === tab.id
                    return (
                      <motion.button
                        key={tab.id}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: isActive ? 1 : 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className={`relative w-full flex items-center gap-3 rounded-xl transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                          sidebarOpen ? "px-3 py-2.5" : "px-0 py-2.5 justify-center"
                        } ${isActive ? "text-white" : "text-[#6b8a99] hover:text-[#d1fae5]"}`}
                      >
                        {isActive && (
                          <motion.div layoutId="activeTab"
                            className="absolute inset-0 rounded-xl bg-[#0f1d24] border border-teal-800/25 animated-border tab-glow-enter"
                            style={{ boxShadow: `0 0 24px ${tab.accent}12, 0 0 48px ${tab.accent}06` }}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                        )}
                        <span className="relative z-10 flex items-center gap-3 min-w-0">
                          <span className="flex-shrink-0" style={{ color: isActive ? tab.accent : undefined }}>
                            {tab.icon}
                          </span>
                          {sidebarOpen && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm font-medium truncate"
                            >
                              {tab.label}
                            </motion.span>
                          )}
                          {sidebarOpen && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-md border leading-none flex-shrink-0 ${
                                isActive ? tab.badgeColor : "text-[#3b6b6b] bg-[#071115]/50 border-[#132d30]"
                              }`}
                            >
                              {tab.badge}
                            </motion.span>
                          )}
                        </span>
                      </motion.button>
                    )
                  })}
                </nav>

                {/* Active tab indicator label when collapsed */}
                {!sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 text-center"
                  >
                    <span className="text-[9px] font-bold text-[#6b8a99] tracking-wider uppercase">
                      {activeTabData.label.split(" ")[0]}
                    </span>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </motion.aside>
        </div>
      </div>

      <footer className="border-t border-[#132d30] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#3b6b6b]">Built by</span>
              <a href="https://x.com/Eli5defi" target="_blank" rel="noopener noreferrer"
                className="text-sm font-semibold text-teal-400 hover:text-teal-300 transition-colors">@Eli5DeFi</a>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-[#3b6b6b]">
              <span>Educational tool</span><div className="w-1 h-1 rounded-full bg-[#132d30]" />
              <span>Real protocol math</span><div className="w-1 h-1 rounded-full bg-[#132d30]" />
              <span>No wallet needed</span><div className="w-1 h-1 rounded-full bg-[#132d30]" />
              <a href="https://github.com/Eli5DeFi/DeFi-Visual" target="_blank" rel="noopener noreferrer"
                className="text-[#6b8a99] hover:text-teal-400 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
