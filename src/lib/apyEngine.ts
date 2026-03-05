/* ── APY / APR Calculation Engine ── */

export interface CompoundingResult {
  day: number
  simpleValue: number      // APR (no compounding)
  compoundedValue: number  // APY (with compounding)
  difference: number       // APY - APR value difference
}

export interface ApySummary {
  apr: number              // Annual Percentage Rate (simple)
  apy: number              // Annual Percentage Yield (compounded)
  dailyRate: number        // Daily interest rate
  totalEarnings: number    // Total earnings over the period
  compoundBonus: number    // Extra earned from compounding vs simple
  effectiveMultiplier: number // Final value / initial value
}

/**
 * Convert APR to APY given compounding frequency per year.
 */
export function aprToApy(apr: number, compoundsPerYear: number): number {
  if (compoundsPerYear <= 0) return apr
  return (Math.pow(1 + apr / compoundsPerYear, compoundsPerYear) - 1) * 100
}

/**
 * Convert APY back to APR given compounding frequency per year.
 */
export function apyToApr(apy: number, compoundsPerYear: number): number {
  if (compoundsPerYear <= 0) return apy
  const apyDecimal = apy / 100
  return (compoundsPerYear * (Math.pow(1 + apyDecimal, 1 / compoundsPerYear) - 1)) * 100
}

/**
 * Generate a growth curve over N days comparing simple vs compounded returns.
 */
export function generateGrowthCurve(
  principal: number,
  aprPercent: number,
  compoundsPerYear: number,
  days: number = 365,
): CompoundingResult[] {
  const dailySimpleRate = aprPercent / 100 / 365
  const compoundInterval = 365 / compoundsPerYear // days between compounds
  const ratePerPeriod = aprPercent / 100 / compoundsPerYear

  const results: CompoundingResult[] = []
  let compoundedValue = principal
  let periodsElapsed = 0

  for (let day = 0; day <= days; day++) {
    const simpleValue = principal * (1 + dailySimpleRate * day)

    // Compound at each interval
    const newPeriods = Math.floor(day / compoundInterval)
    if (newPeriods > periodsElapsed) {
      const periodsToApply = newPeriods - periodsElapsed
      compoundedValue *= Math.pow(1 + ratePerPeriod, periodsToApply)
      periodsElapsed = newPeriods
    }

    // Only push every Nth day for reasonable chart density
    const step = days <= 365 ? 1 : Math.max(1, Math.floor(days / 365))
    if (day % step === 0 || day === days) {
      results.push({
        day,
        simpleValue: Math.round(simpleValue * 100) / 100,
        compoundedValue: Math.round(compoundedValue * 100) / 100,
        difference: Math.round((compoundedValue - simpleValue) * 100) / 100,
      })
    }
  }

  return results
}

/**
 * Calculate APY summary stats.
 */
export function calculateApySummary(
  principal: number,
  aprPercent: number,
  compoundsPerYear: number,
  days: number = 365,
): ApySummary {
  const apr = aprPercent
  const apy = aprToApy(aprPercent / 100, compoundsPerYear)
  const dailyRate = aprPercent / 365

  const simpleEarnings = principal * (aprPercent / 100) * (days / 365)
  const ratePerPeriod = aprPercent / 100 / compoundsPerYear
  const totalPeriods = compoundsPerYear * (days / 365)
  const compoundedValue = principal * Math.pow(1 + ratePerPeriod, totalPeriods)
  const compoundedEarnings = compoundedValue - principal

  return {
    apr,
    apy,
    dailyRate: Math.round(dailyRate * 10000) / 10000,
    totalEarnings: Math.round(compoundedEarnings * 100) / 100,
    compoundBonus: Math.round((compoundedEarnings - simpleEarnings) * 100) / 100,
    effectiveMultiplier: Math.round((compoundedValue / principal) * 10000) / 10000,
  }
}

/**
 * Compounding frequency presets.
 */
export const COMPOUND_FREQUENCIES = [
  { label: "Annually", value: 1 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Weekly", value: 52 },
  { label: "Daily", value: 365 },
  { label: "Per Block (~12s)", value: 2_628_000 },
] as const
