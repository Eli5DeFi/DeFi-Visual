/* ── DeFi Composability / Money Legos Engine ── */

export interface LegoBlock {
  id: string
  protocol: string
  action: string
  color: string        // teal, amber, cyan, rose, emerald, purple
  inputToken: string
  outputToken: string
  apy: number          // base APY for this step
  risk: number         // 0-10 risk score
  description: string
}

export interface StackResult {
  blocks: LegoBlock[]
  totalApy: number
  compoundedApy: number
  riskScore: number
  capitalEfficiency: number  // multiplier on initial capital
  gasEstimate: number        // estimated gas in USD
  netApy: number             // APY minus gas costs annualized
}

export interface FlowStep {
  step: number
  protocol: string
  action: string
  inputToken: string
  inputAmount: number
  outputToken: string
  outputAmount: number
  apyEarned: number
  cumulativeApy: number
  riskAdded: number
}

/** Available DeFi building blocks */
export const LEGO_BLOCKS: LegoBlock[] = [
  {
    id: "aave-supply",
    protocol: "Aave",
    action: "Supply",
    color: "teal",
    inputToken: "ETH",
    outputToken: "aETH",
    apy: 3.2,
    risk: 2,
    description: "Lend ETH to earn interest from borrowers",
  },
  {
    id: "aave-borrow",
    protocol: "Aave",
    action: "Borrow",
    color: "rose",
    inputToken: "aETH",
    outputToken: "USDC",
    apy: -4.5,
    risk: 4,
    description: "Borrow USDC against aETH collateral",
  },
  {
    id: "uniswap-lp",
    protocol: "Uniswap",
    action: "LP",
    color: "amber",
    inputToken: "ETH+USDC",
    outputToken: "UNI-LP",
    apy: 12.5,
    risk: 5,
    description: "Provide ETH/USDC liquidity to earn trading fees",
  },
  {
    id: "lido-stake",
    protocol: "Lido",
    action: "Stake",
    color: "cyan",
    inputToken: "ETH",
    outputToken: "stETH",
    apy: 3.8,
    risk: 2,
    description: "Liquid staking ETH for stETH + staking rewards",
  },
  {
    id: "curve-lp",
    protocol: "Curve",
    action: "LP",
    color: "amber",
    inputToken: "stETH+ETH",
    outputToken: "crvLP",
    apy: 5.2,
    risk: 3,
    description: "Provide stETH/ETH liquidity on Curve",
  },
  {
    id: "convex-stake",
    protocol: "Convex",
    action: "Stake",
    color: "emerald",
    inputToken: "crvLP",
    outputToken: "cvxLP",
    apy: 8.5,
    risk: 3,
    description: "Stake Curve LP tokens for boosted CRV + CVX rewards",
  },
  {
    id: "pendle-yt",
    protocol: "Pendle",
    action: "Buy YT",
    color: "purple",
    inputToken: "stETH",
    outputToken: "YT-stETH",
    apy: 25.0,
    risk: 7,
    description: "Buy yield tokens for leveraged yield exposure",
  },
  {
    id: "yearn-vault",
    protocol: "Yearn",
    action: "Vault",
    color: "cyan",
    inputToken: "USDC",
    outputToken: "yvUSDC",
    apy: 6.8,
    risk: 3,
    description: "Auto-compounding USDC yield strategies",
  },
  {
    id: "morpho-supply",
    protocol: "Morpho",
    action: "Supply",
    color: "teal",
    inputToken: "USDC",
    outputToken: "mUSDC",
    apy: 5.5,
    risk: 2,
    description: "Optimized lending rates via P2P matching",
  },
  {
    id: "eigenlayer-restake",
    protocol: "EigenLayer",
    action: "Restake",
    color: "emerald",
    inputToken: "stETH",
    outputToken: "rstETH",
    apy: 4.2,
    risk: 5,
    description: "Restake stETH for additional AVS rewards",
  },
]

/** Predefined strategy templates */
export const STRATEGY_TEMPLATES = [
  {
    name: "ETH Staking + Restaking",
    description: "Simple liquid staking with EigenLayer restaking",
    blockIds: ["lido-stake", "eigenlayer-restake"],
  },
  {
    name: "Recursive Lending Loop",
    description: "Supply ETH → Borrow USDC → Supply USDC (leverage loop)",
    blockIds: ["aave-supply", "aave-borrow", "morpho-supply"],
  },
  {
    name: "Curve Wars Stack",
    description: "Lido → Curve LP → Convex for boosted rewards",
    blockIds: ["lido-stake", "curve-lp", "convex-stake"],
  },
  {
    name: "Pendle Yield Play",
    description: "Lido staking + Pendle YT for leveraged yield",
    blockIds: ["lido-stake", "pendle-yt"],
  },
  {
    name: "Stablecoin Optimizer",
    description: "Borrow USDC from Aave → Yearn auto-compound",
    blockIds: ["aave-supply", "aave-borrow", "yearn-vault"],
  },
] as const

/**
 * Calculate the result of stacking DeFi lego blocks.
 */
export function calculateStack(blockIds: string[], principal: number): StackResult {
  const blocks = blockIds
    .map((id) => LEGO_BLOCKS.find((b) => b.id === id))
    .filter((b): b is LegoBlock => b !== undefined)

  if (blocks.length === 0) {
    return {
      blocks: [],
      totalApy: 0,
      compoundedApy: 0,
      riskScore: 0,
      capitalEfficiency: 1,
      gasEstimate: 0,
      netApy: 0,
    }
  }

  // Sum up APYs (simplified — real composability multiplies in complex ways)
  const totalApy = blocks.reduce((sum, b) => sum + b.apy, 0)

  // Compounded APY (accounting for multiplicative effects)
  const compoundedApy = blocks.reduce((apy, b) => {
    if (b.apy < 0) return apy + b.apy // borrowing cost subtracts linearly
    return apy + b.apy * (1 + apy / 100 * 0.15) // positive yields compound slightly
  }, 0)

  // Risk compounds non-linearly — more blocks = more smart contract risk
  const baseRisk = blocks.reduce((sum, b) => sum + b.risk, 0)
  const riskScore = Math.min(10, baseRisk * (1 + (blocks.length - 1) * 0.15))

  // Capital efficiency — borrowing enables leverage
  const hasBorrowing = blocks.some((b) => b.apy < 0)
  const capitalEfficiency = hasBorrowing ? 1.5 + blocks.length * 0.2 : 1 + blocks.length * 0.05

  // Gas estimate: ~$5 per interaction on L1
  const gasEstimate = blocks.length * 5

  // Net APY after gas costs (annualized)
  const annualGasCost = gasEstimate * 12 // assume monthly rebalancing
  const netApy = totalApy - (annualGasCost / principal) * 100

  return {
    blocks,
    totalApy: Math.round(totalApy * 100) / 100,
    compoundedApy: Math.round(compoundedApy * 100) / 100,
    riskScore: Math.round(riskScore * 10) / 10,
    capitalEfficiency: Math.round(capitalEfficiency * 100) / 100,
    gasEstimate: Math.round(gasEstimate * 100) / 100,
    netApy: Math.round(netApy * 100) / 100,
  }
}

/**
 * Generate step-by-step flow for a stack.
 */
export function generateFlow(blockIds: string[], principal: number): FlowStep[] {
  const blocks = blockIds
    .map((id) => LEGO_BLOCKS.find((b) => b.id === id))
    .filter((b): b is LegoBlock => b !== undefined)

  const steps: FlowStep[] = []
  let currentAmount = principal
  let cumulativeApy = 0

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i]
    const outputAmount = block.apy < 0
      ? currentAmount * 0.75 // borrowing gives ~75% LTV
      : currentAmount * (1 + block.apy / 100 / 12) // 1 month of yield

    cumulativeApy += block.apy

    steps.push({
      step: i + 1,
      protocol: block.protocol,
      action: block.action,
      inputToken: block.inputToken,
      inputAmount: Math.round(currentAmount * 100) / 100,
      outputToken: block.outputToken,
      outputAmount: Math.round(outputAmount * 100) / 100,
      apyEarned: block.apy,
      cumulativeApy: Math.round(cumulativeApy * 100) / 100,
      riskAdded: block.risk,
    })

    currentAmount = outputAmount
  }

  return steps
}
