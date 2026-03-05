/* ── Funding Rate & Open Interest Engine ── */

export interface FundingSnapshot {
  hour: number
  fundingRate: number       // % per period
  longOI: number            // total long open interest in USD
  shortOI: number           // total short open interest in USD
  markPrice: number
  indexPrice: number
  longPayment: number       // payment from longs (positive = longs pay)
  shortPayment: number      // payment to shorts (positive = shorts receive)
  cumulativeLongCost: number
  cumulativeShortEarnings: number
}

export interface PositionPnL {
  unrealizedPnL: number
  fundingPaid: number        // total funding paid (positive = cost)
  fundingReceived: number    // total funding received
  netFundingCost: number     // paid - received
  effectiveEntry: number     // entry price adjusted for funding
  liquidationPrice: number
  marginUsed: number
  leverage: number
}

/**
 * Calculate the funding rate based on mark-index price deviation.
 * Simplified model: funding rate = clamp((mark - index) / index * multiplier, -maxRate, maxRate)
 */
export function calculateFundingRate(
  markPrice: number,
  indexPrice: number,
  maxRate: number = 0.1,   // max 0.1% per 8h period
  sensitivity: number = 0.5,
): number {
  const premium = (markPrice - indexPrice) / indexPrice
  const rate = premium * sensitivity * 100
  return Math.max(-maxRate, Math.min(maxRate, rate))
}

/**
 * Calculate payment amounts for a funding period.
 */
export function calculateFundingPayment(
  positionSize: number,
  fundingRate: number,
  isLong: boolean,
): number {
  // Positive funding rate: longs pay shorts
  // Negative funding rate: shorts pay longs
  const payment = positionSize * (fundingRate / 100)
  return isLong ? payment : -payment
}

/**
 * Generate funding rate history simulation.
 * Simulates price oscillation with trend + noise.
 */
export function generateFundingHistory(
  basePrice: number,
  hours: number,
  longBias: number,       // 0-1, how much more longs vs shorts (0.5 = balanced)
  volatility: number,     // price volatility factor
  totalOI: number,        // total open interest
): FundingSnapshot[] {
  const snapshots: FundingSnapshot[] = []
  let cumulativeLongCost = 0
  let cumulativeShortEarnings = 0

  // Seed a deterministic-ish random
  let seed = Math.round(longBias * 1000 + volatility * 100 + totalOI / 1000)
  const seededRandom = () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed & 0x7fffffff) / 0x7fffffff
  }

  for (let h = 0; h <= hours; h++) {
    // Oscillating price with trend
    const trend = Math.sin(h / 24 * Math.PI * 2) * volatility * 0.02
    const noise = (seededRandom() - 0.5) * volatility * 0.01
    const priceDeviation = trend + noise

    const markPrice = basePrice * (1 + priceDeviation + (longBias - 0.5) * 0.005)
    const indexPrice = basePrice * (1 + priceDeviation * 0.3)

    const fundingRate = calculateFundingRate(markPrice, indexPrice)

    // OI split based on bias
    const longOI = totalOI * longBias
    const shortOI = totalOI * (1 - longBias)

    const longPayment = longOI * (fundingRate / 100)
    const shortPayment = -shortOI * (fundingRate / 100)

    cumulativeLongCost += longPayment
    cumulativeShortEarnings += -shortPayment

    snapshots.push({
      hour: h,
      fundingRate: Math.round(fundingRate * 10000) / 10000,
      longOI: Math.round(longOI),
      shortOI: Math.round(shortOI),
      markPrice: Math.round(markPrice * 100) / 100,
      indexPrice: Math.round(indexPrice * 100) / 100,
      longPayment: Math.round(longPayment * 100) / 100,
      shortPayment: Math.round(shortPayment * 100) / 100,
      cumulativeLongCost: Math.round(cumulativeLongCost * 100) / 100,
      cumulativeShortEarnings: Math.round(cumulativeShortEarnings * 100) / 100,
    })
  }

  return snapshots
}

/**
 * Calculate PnL for a position including funding costs.
 */
export function calculatePositionPnL(
  entryPrice: number,
  currentPrice: number,
  positionSize: number,
  leverage: number,
  isLong: boolean,
  cumulativeFundingRate: number, // sum of all funding rates since entry
): PositionPnL {
  const margin = positionSize / leverage
  const priceDelta = currentPrice - entryPrice
  const unrealizedPnL = isLong
    ? (priceDelta / entryPrice) * positionSize
    : (-priceDelta / entryPrice) * positionSize

  const fundingCost = positionSize * (cumulativeFundingRate / 100)
  const fundingPaid = isLong && fundingCost > 0 ? fundingCost : (!isLong && fundingCost < 0 ? -fundingCost : 0)
  const fundingReceived = isLong && fundingCost < 0 ? -fundingCost : (!isLong && fundingCost > 0 ? fundingCost : 0)

  const netFundingCost = fundingPaid - fundingReceived
  const effectiveEntry = isLong
    ? entryPrice * (1 + cumulativeFundingRate / 100)
    : entryPrice * (1 - cumulativeFundingRate / 100)

  // Simplified liquidation: when losses = margin
  const liquidationDistance = margin / positionSize * entryPrice
  const liquidationPrice = isLong
    ? entryPrice - liquidationDistance + netFundingCost / positionSize * entryPrice
    : entryPrice + liquidationDistance - netFundingCost / positionSize * entryPrice

  return {
    unrealizedPnL: Math.round(unrealizedPnL * 100) / 100,
    fundingPaid: Math.round(fundingPaid * 100) / 100,
    fundingReceived: Math.round(fundingReceived * 100) / 100,
    netFundingCost: Math.round(netFundingCost * 100) / 100,
    effectiveEntry: Math.round(effectiveEntry * 100) / 100,
    liquidationPrice: Math.round(liquidationPrice * 100) / 100,
    marginUsed: Math.round(margin * 100) / 100,
    leverage,
  }
}

/**
 * Calculate annualized funding rate from periodic rate.
 */
export function annualizeFundingRate(periodicRate: number, periodsPerYear: number = 1095): number {
  // 365 * 3 funding periods per year (every 8 hours)
  return periodicRate * periodsPerYear
}
