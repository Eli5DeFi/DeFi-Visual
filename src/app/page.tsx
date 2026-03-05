"use client"

import React from "react"
import { motion } from "framer-motion"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import AMMSimulator from "@/components/amm/AMMSimulator"
import MEVSimulator from "@/components/mev/MEVSimulator"

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      {/* Hero Header */}
      <header className="relative overflow-hidden border-b border-slate-800">
        {/* Animated background gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-transparent to-purple-950/40" />
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(139,92,246,0.15) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-950/50 border border-blue-800/30 text-blue-400 text-sm font-medium mb-6">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              Interactive DeFi Education
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
                DeFi Visual
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
              Learn DeFi mechanisms through interactive simulations.
              Experiment with real math, see real results.
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="amm">
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="amm" className="gap-2">
              <span className="hidden sm:inline">&#x1f504;</span> Anatomy of AMMs &amp; Impermanent Loss
            </TabsTrigger>
            <TabsTrigger value="mev" className="gap-2">
              <span className="hidden sm:inline">&#x1f96a;</span> MEV &amp; Sandwich Attacks
            </TabsTrigger>
            <TabsTrigger value="coming-soon-1" className="gap-2 opacity-50 cursor-not-allowed" disabled>
              <span className="hidden sm:inline">&#x1f3e6;</span> Lending &amp; Borrowing
            </TabsTrigger>
            <TabsTrigger value="coming-soon-2" className="gap-2 opacity-50 cursor-not-allowed" disabled>
              <span className="hidden sm:inline">&#x1f33e;</span> Yield Farming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="amm">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <AMMSimulator />
            </motion.div>
          </TabsContent>

          <TabsContent value="mev">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <MEVSimulator />
            </motion.div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Built by</span>
              <a
                href="https://x.com/Eli5defi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Eli5DeFi
              </a>
            </div>
            <div className="text-slate-500 text-xs">
              Educational tool &mdash; not financial advice
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
