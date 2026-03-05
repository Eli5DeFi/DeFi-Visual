/**
 * pendleEngine.ts — Pendle SY / PT / YT yield-tokenization math
 *
 * Core invariant:  1 SY (at exchangeRate) = PT + YT  (in underlying units)
 *
 * PT = zero-coupon bond → price = 1 / (1 + r)^(t/365)
 * YT = yield claim     → price = 1 − PT price
 *
 * Implied APY = [(1 + YT_price / PT_price)^(365 / daysToExpiry)] − 1
 */

/* ── Interfaces ── */

export interface MintResult {
  syDeposited: number;
  ptMinted: number;
  ytMinted: number;
  exchangeRate: number;
}

export interface PTYTPricing {
  ptPrice: number;         // in underlying terms (0‒1)
  ytPrice: number;         // in underlying terms (0‒1)
  fixedAPY: number;        // annualised fixed yield from buying PT now
  impliedAPY: number;
  daysRemaining: number;
}

export interface YieldPoint {
  day: number;
  ptPrice: number;
  ytPrice: number;
  ytYieldAccrued: number;  // cumulative yield earned by YT holder
  ptTotalValue: number;    // PT price gain relative to purchase
  ytTotalValue: number;    // YT residual price + accrued yield
}

export interface StrategyComparison {
  investmentUSD: number;
  ptUnits: number;
  ytUnits: number;
  ptFixedReturn: number;
  ytExpectedReturn: number;
  ptROI: number;
  ytROI: number;
  breakEvenAPY: number;     // underlying APY needed for YT to break even
}

/* ── Core pricing ── */

/** PT price = 1 / (1 + impliedAPY)^(daysRemaining / 365) */
export const calculatePTPrice = (
  impliedAPY: number,
  daysRemaining: number,
): number => {
  if (daysRemaining <= 0) return 1;
  return 1 / Math.pow(1 + impliedAPY, daysRemaining / 365);
};

/** YT price = 1 − PT price  (in underlying terms) */
export const calculateYTPrice = (ptPrice: number): number =>
  Math.max(0, 1 - ptPrice);

/** Implied APY = [(1 + YT/PT)^(365/days)] − 1 */
export const calculateImpliedAPY = (
  ytPrice: number,
  ptPrice: number,
  daysToExpiry: number,
): number => {
  if (daysToExpiry <= 0 || ptPrice <= 0) return 0;
  return Math.pow(1 + ytPrice / ptPrice, 365 / daysToExpiry) - 1;
};

/* ── Minting ── */

/**
 * Deposit SY → mint PT + YT.
 * Amount of PT & YT minted = syAmount × exchangeRate (underlying units).
 */
export const mintPTYT = (
  syAmount: number,
  exchangeRate: number,
): MintResult => {
  const underlyingValue = syAmount * exchangeRate;
  return {
    syDeposited: syAmount,
    ptMinted: underlyingValue,
    ytMinted: underlyingValue,
    exchangeRate,
  };
};

/* ── Full pricing snapshot ── */

export const getPTYTPricing = (
  impliedAPY: number,
  daysRemaining: number,
): PTYTPricing => {
  const ptPrice = calculatePTPrice(impliedAPY, daysRemaining);
  const ytPrice = calculateYTPrice(ptPrice);
  const fixedAPY =
    daysRemaining > 0
      ? Math.pow(1 / ptPrice, 365 / daysRemaining) - 1
      : 0;

  return { ptPrice, ytPrice, fixedAPY, impliedAPY, daysRemaining };
};

/* ── Time-series simulation ── */

/**
 * Generate PT price & YT price + accrued yield over the life of the market.
 * Assumes a constant implied APY (simplified — real markets fluctuate).
 */
export const simulateOverTime = (
  totalDays: number,
  impliedAPY: number,
  underlyingAPY: number,
): YieldPoint[] => {
  const points: YieldPoint[] = [];
  const steps = Math.min(totalDays, 120);
  const stepSize = totalDays / steps;
  const initialPTPrice = calculatePTPrice(impliedAPY, totalDays);

  for (let i = 0; i <= steps; i++) {
    const day = Math.round(i * stepSize);
    const daysRemaining = totalDays - day;

    const ptPrice = calculatePTPrice(impliedAPY, daysRemaining);
    const ytPrice = calculateYTPrice(ptPrice);

    // YT holder accrues underlying yield daily
    const ytYieldAccrued = (underlyingAPY / 365) * day;

    // PT value: relative to purchase price
    const ptTotalValue = ptPrice / initialPTPrice;

    // YT total value: remaining resale price + accrued yield already claimed
    const ytTotalValue = ytPrice + ytYieldAccrued;

    points.push({
      day,
      ptPrice: +ptPrice.toFixed(6),
      ytPrice: +ytPrice.toFixed(6),
      ytYieldAccrued: +ytYieldAccrued.toFixed(6),
      ptTotalValue: +ptTotalValue.toFixed(6),
      ytTotalValue: +ytTotalValue.toFixed(6),
    });
  }
  return points;
};

/* ── Strategy comparison ── */

/**
 * Compare a $1 000 investment into PT vs YT.
 * PT: buy at discount → redeem 1:1 at maturity (fixed return).
 * YT: buy yield claim → collect underlying APY until maturity.
 */
export const compareStrategies = (
  investmentUSD: number,
  impliedAPY: number,
  underlyingAPY: number,
  daysToMaturity: number,
  underlyingPriceUSD: number,
): StrategyComparison => {
  const ptPrice = calculatePTPrice(impliedAPY, daysToMaturity);
  const ytPrice = calculateYTPrice(ptPrice);

  // Convert USD to underlying units, then to PT/YT units
  const underlyingUnits = investmentUSD / underlyingPriceUSD;
  const ptUnits = underlyingUnits / ptPrice;   // buy more because discount
  const ytUnits = underlyingUnits / ytPrice;   // buy many because cheap

  // PT: each PT redeems for 1 underlying at maturity
  const ptMaturityValue = ptUnits * underlyingPriceUSD;
  const ptFixedReturn = ptMaturityValue - investmentUSD;

  // YT: each YT earns (underlyingAPY / 365 * daysToMaturity) yield in underlying
  const yieldPerYT = (underlyingAPY / 365) * daysToMaturity;
  const ytTotalYield = ytUnits * yieldPerYT * underlyingPriceUSD;
  const ytExpectedReturn = ytTotalYield - investmentUSD;

  // Breakeven: underlying APY at which YT return = 0
  // ytUnits * (breakAPY/365 * days) * price = investment
  // breakAPY = investment / (ytUnits * days/365 * price)
  const breakEvenAPY =
    ytUnits > 0 && daysToMaturity > 0
      ? investmentUSD / (ytUnits * (daysToMaturity / 365) * underlyingPriceUSD)
      : 0;

  return {
    investmentUSD,
    ptUnits: +ptUnits.toFixed(4),
    ytUnits: +ytUnits.toFixed(4),
    ptFixedReturn: +ptFixedReturn.toFixed(2),
    ytExpectedReturn: +ytExpectedReturn.toFixed(2),
    ptROI: +((ptFixedReturn / investmentUSD) * 100).toFixed(2),
    ytROI: +((ytExpectedReturn / investmentUSD) * 100).toFixed(2),
    breakEvenAPY: +breakEvenAPY.toFixed(4),
  };
};
