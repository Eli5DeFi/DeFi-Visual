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
    title: "APR vs APY",
    icon: "\u{1F4CA}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          <strong className="text-white">APR (Annual Percentage Rate)</strong> is the simple interest
          rate — it does not account for compounding. If you earn 10% APR on $1,000, you earn exactly
          $100 after one year.
        </p>
        <p>
          <strong className="text-white">APY (Annual Percentage Yield)</strong> includes the effect of
          compounding — earning interest on your interest. The same 10% APR compounded daily yields
          ~10.52% APY.
        </p>
        <div className="bg-[#030712] rounded-lg p-4 text-center font-mono text-lg text-teal-400">
          APY = (1 + APR/n)<sup>n</sup> - 1
        </div>
      </div>
    ),
  },
  {
    title: "Compounding Frequency",
    icon: "\u{1F504}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <p>
          The more frequently you compound, the higher your effective yield. In DeFi, auto-compounding
          vaults can compound as often as every block (~12 seconds on Ethereum).
        </p>
        <div className="bg-[#030712] rounded-lg p-3 font-mono text-xs space-y-1">
          <div className="flex justify-between"><span className="text-[#6b8a99]">Annually (1x):</span><span className="text-white">10.00% APY</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Monthly (12x):</span><span className="text-white">10.47% APY</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Daily (365x):</span><span className="text-white">10.52% APY</span></div>
          <div className="flex justify-between"><span className="text-[#6b8a99]">Per Block:</span><span className="text-cyan-400">10.52% APY</span></div>
        </div>
        <p className="text-xs text-[#3b6b6b]">
          * All examples assume 10% APR base rate
        </p>
      </div>
    ),
  },
  {
    title: "DeFi Yield Sources",
    icon: "\u{1F331}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <ul className="space-y-2 ml-1">
          <li>
            <strong className="text-white">Lending:</strong> Supply assets to Aave/Compound and earn
            interest from borrowers. Typical: 1-8% APY.
          </li>
          <li>
            <strong className="text-white">LP Fees:</strong> Provide liquidity to AMMs like Uniswap
            and earn trading fees. Varies by pair and volume.
          </li>
          <li>
            <strong className="text-white">Staking:</strong> Stake tokens (like ETH) to help secure
            the network. ETH staking: ~3-5% APY.
          </li>
          <li>
            <strong className="text-white">Yield Farming:</strong> Earn bonus token rewards on top of
            base yield. Can be very high but often temporary.
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Risks & Gotchas",
    icon: "\u{26A0}\u{FE0F}",
    content: (
      <div className="space-y-3 text-[#a7d3c0] text-sm leading-relaxed">
        <ul className="space-y-2 ml-1">
          <li className="text-[#6b8a99]">
            <strong className="text-white">Advertised APY vs actual:</strong> Many protocols show APY
            assuming continuous compounding, but actual returns depend on gas costs and compound frequency.
          </li>
          <li className="text-[#6b8a99]">
            <strong className="text-white">Impermanent loss:</strong> LP positions can lose value if
            token prices diverge — the APY needs to exceed IL to be profitable.
          </li>
          <li className="text-[#6b8a99]">
            <strong className="text-white">Token inflation:</strong> High APY from farming rewards may
            be offset by the reward token losing value.
          </li>
          <li className="text-[#6b8a99]">
            <strong className="text-white">Gas costs:</strong> Compounding on L1 Ethereum costs gas.
            Small positions may not benefit from frequent compounding.
          </li>
        </ul>
      </div>
    ),
  },
]

export default function APYConceptExplainer() {
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
