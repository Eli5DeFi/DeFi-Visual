/* ── Delta-Neutral Strategy Engine ── */

export interface DNPosition {
  spotSize: number          // USD value of spot holding
  perpShortSize: number     // USD notional of short perp
  netDelta: number          // ideally 0
  collateral: number        // margin for perp position
  leverage: number
}

export interface DNSnapshot {
  day: number
  ethPrice: number
  spotValue: number
  perpPnL: number           // unrealized PnL on short perp
  netPositionValue: number  // spot + perp PnL combined
  fundingIncome: number     // cumulative funding received
  totalValue: number        // netPositionValue + fundingIncome
  yieldPct: number          // total return %
  annualizedYield: number
  delta: number             // net delta (should be ~0)
}

export interface EthenaMetrics {
  usdeCollateral: number     // ETH/stETH collateral value
  shortPerpNotional: number
  dailyFundingYield: number
  annualizedYield: number
  backingRatio: number       // should be >= 1
  totalUsde: number
  reserveFund: number
}

/**
 * Simulate a delta-neutral position over time.
 * Spot long + equal short perp. Funding income = yield source.
 */
export function simulateDeltaNeutral(
  initialPrice: number,
  positionSize: number,   // in USD
  fundingRate8h: number,  // % per 8h period (e.g. 0.01)
  days: number,
  priceVolatility: number, // % daily vol
  leverage: number,
): DNSnapshot[] {
  const snapshots: DNSnapshot[] = []
  const ethAmount = positionSize / initialPrice
  let cumulativeFunding = 0

  // Deterministic random
  let seed = Math.round(fundingRate8h * 100000 + priceVolatility * 1000 + days)
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed & 0x7fffffff) / 0x7fffffff - 0.5
  }

  for (let d = 0; d <= days; d++) {
    // Price random walk with mean reversion
    const priceChange = rand() * priceVolatility / 100
    const ethPrice = initialPrice * (1 + priceChange * Math.sqrt(d + 1) * 0.3)

    // Spot value
    const spotValue = ethAmount * ethPrice

    // Short perp PnL (profit when price drops, loss when rises)
    const perpPnL = -(ethPrice - initialPrice) * ethAmount

    const netPositionValue = spotValue + perpPnL // should be ~positionSize

    // Funding income: 3 periods per day, short receives when rate > 0
    const dailyFunding = positionSize * (fundingRate8h / 100) * 3
    // Add some variance to daily funding
    const fundingVariance = 1 + rand() * 0.3
    const todayFunding = d === 0 ? 0 : dailyFunding * Math.max(0.1, fundingVariance)
    cumulativeFunding += todayFunding

    const totalValue = netPositionValue + cumulativeFunding
    const yieldPct = ((totalValue - positionSize) / positionSize) * 100
    const annualized = d > 0 ? (yieldPct / d) * 365 : 0

    snapshots.push({
      day: d,
      ethPrice: Math.round(ethPrice * 100) / 100,
      spotValue: Math.round(spotValue * 100) / 100,
      perpPnL: Math.round(perpPnL * 100) / 100,
      netPositionValue: Math.round(netPositionValue * 100) / 100,
      fundingIncome: Math.round(cumulativeFunding * 100) / 100,
      totalValue: Math.round(totalValue * 100) / 100,
      yieldPct: Math.round(yieldPct * 1000) / 1000,
      annualizedYield: Math.round(annualized * 100) / 100,
      delta: Math.round((spotValue / positionSize - 1 + perpPnL / positionSize) * 10000) / 10000,
    })
  }

  return snapshots
}

/**
 * Calculate Ethena USDe-style metrics.
 * USDe is backed 1:1 by a delta-neutral position (stETH spot + ETH short perp).
 */
export function calculateEthenaMetrics(
  totalUsde: number,
  ethPrice: number,
  avgFundingRate8h: number,   // %
  reservePct: number,         // % of yield allocated to reserve
): EthenaMetrics {
  const collateral = totalUsde  // 1:1 backing
  const shortNotional = collateral
  const dailyFundingYield = shortNotional * (avgFundingRate8h / 100) * 3
  const annualized = (dailyFundingYield * 365 / collateral) * 100 * (1 - reservePct / 100)

  return {
    usdeCollateral: collateral,
    shortPerpNotional: shortNotional,
    dailyFundingYield: Math.round(dailyFundingYield * 100) / 100,
    annualizedYield: Math.round(annualized * 100) / 100,
    backingRatio: 1.0,
    totalUsde,
    reserveFund: Math.round(totalUsde * reservePct / 100),
  }
}

/**
 * Calculate risk metrics for a DN position.
 */
export function calculateDNRisks(
  positionSize: number,
  leverage: number,
  fundingRate8h: number,
  ethPrice: number,
): {
  liquidationPriceUp: number
  maxNegFundingDays: number
  dailyFundingIncome: number
  breakEvenDays: number
  marginRequired: number
} {
  const margin = positionSize / leverage
  // Liquidation when perp losses exceed margin
  // Short perp liquidation = entry * (1 + margin/notional)
  const liquidationPriceUp = ethPrice * (1 + 1 / leverage)

  const dailyFundingIncome = positionSize * (fundingRate8h / 100) * 3
  // How many days of negative funding at same rate before wiping out 30 days of income
  const maxNegFundingDays = Math.round((dailyFundingIncome * 30) / dailyFundingIncome)

  // Break-even = trading fees / daily funding
  const tradingFees = positionSize * 0.001 * 2 // 0.1% taker fee × 2 (spot + perp)
  const breakEvenDays = dailyFundingIncome > 0 ? Math.ceil(tradingFees / dailyFundingIncome) : Infinity

  return {
    liquidationPriceUp: Math.round(liquidationPriceUp * 100) / 100,
    maxNegFundingDays: 30,
    dailyFundingIncome: Math.round(dailyFundingIncome * 100) / 100,
    breakEvenDays,
    marginRequired: Math.round(margin * 100) / 100,
  }
}
