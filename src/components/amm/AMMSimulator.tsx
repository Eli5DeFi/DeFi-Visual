"use client"

import React, { useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  calculateSwap,
  calculateSwapYtoX,
  PoolState,
} from "@/lib/mathEngine"
import PoolVisualizer from "./PoolVisualizer"
import ConstantProductChart from "./ConstantProductChart"
import ILChart from "./ILChart"
import SwapPanel from "./SwapPanel"
import ConceptExplainer from "./ConceptExplainer"

const INITIAL_STATE: PoolState = {
  tokenX: 10,
  tokenY: 20000,
  k: 200000,
  initialPrice: 2000,
}

export default function AMMSimulator() {
  const [pool, setPool] = useState<PoolState>(INITIAL_STATE)
  const [swapAmount, setSwapAmount] = useState<number>(1)
  const [direction, setDirection] = useState<"x-to-y" | "y-to-x">("x-to-y")
  const [il, setIl] = useState<number>(0)
  const [totalFees, setTotalFees] = useState<number>(0)
  const [feeRate, setFeeRate] = useState<number>(0.003)
  const [swapHistory, setSwapHistory] = useState<
    Array<{ direction: string; amount: number }>
  >([])

  const preview = useMemo(() => {
    if (direction === "x-to-y") {
      return calculateSwap(pool, swapAmount, feeRate)
    }
    return calculateSwapYtoX(pool, swapAmount, feeRate)
  }, [pool, swapAmount, direction, feeRate])

  const currentPriceChange = useMemo(() => {
    const currentPrice = pool.tokenY / pool.tokenX
    return ((currentPrice - INITIAL_STATE.initialPrice) / INITIAL_STATE.initialPrice) * 100
  }, [pool])

  const handleSwap = useCallback(() => {
    setPool(preview.newState)
    setIl(preview.impermanentLoss)
    setTotalFees((prev) => prev + preview.feeEarned)
    setSwapHistory((prev) => [
      ...prev,
      { direction, amount: swapAmount },
    ])
  }, [preview, direction, swapAmount])

  const handleReset = useCallback(() => {
    setPool(INITIAL_STATE)
    setIl(0)
    setTotalFees(0)
    setSwapHistory([])
    setSwapAmount(direction === "x-to-y" ? 1 : 500)
  }, [direction])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Visualizations */}
      <div className="lg:col-span-2 space-y-6">
        {/* Pool Visualizer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              Liquidity Pool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PoolVisualizer
              pool={pool}
              initialState={INITIAL_STATE}
              impermanentLoss={il}
              totalFeesEarned={totalFees}
              swapHistory={swapHistory}
            />
          </CardContent>
        </Card>

        {/* Charts in tabs */}
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue="curve">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="curve">x × y = k Curve</TabsTrigger>
                <TabsTrigger value="il">Impermanent Loss</TabsTrigger>
              </TabsList>
              <TabsContent value="curve">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[250px] sm:h-[300px]"
                >
                  <ConstantProductChart
                    pool={pool}
                    initialState={INITIAL_STATE}
                  />
                </motion.div>
              </TabsContent>
              <TabsContent value="il">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-[250px] sm:h-[300px]"
                >
                  <ILChart
                    currentPriceChange={currentPriceChange}
                    currentIL={il}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Right column: Controls and Education */}
      <div className="space-y-6">
        {/* Swap Panel */}
        <Card>
          <CardContent className="p-6">
            <SwapPanel
              preview={preview}
              swapAmount={swapAmount}
              setSwapAmount={setSwapAmount}
              direction={direction}
              setDirection={setDirection}
              onSwap={handleSwap}
              onReset={handleReset}
              maxAmountX={pool.tokenX * 0.9}
              maxAmountY={pool.tokenY * 0.9}
              feeRate={feeRate}
              setFeeRate={setFeeRate}
            />
          </CardContent>
        </Card>

        {/* Concept Explainer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">
              Learn the Concepts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ConceptExplainer />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
