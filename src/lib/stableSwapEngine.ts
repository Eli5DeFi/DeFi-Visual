/* ── Curve StableSwap Math Engine ──
 *
 * Implements the StableSwap invariant from Michael Egorov's whitepaper:
 *   A·n^n · Σxᵢ  +  D  =  A·n^n · D  +  D^(n+1) / (n^n · Πxᵢ)
 *
 * For a 2-token pool (n=2):
 *   4A(x + y) + D = 4AD + D³/(4xy)
 *
 * References:
 *   - StableSwap whitepaper: https://berkeley-defi.github.io/assets/material/StableSwap.pdf
 *   - Curve Math: https://docs.curve.finance/stableswap-exchange/stableswap-ng/utility_contracts/math/
 *   - RareSkills derivation: https://rareskills.io/post/curve-get-d-get-y
 */

const N_COINS = 2
const MAX_ITERATIONS = 256
const CONVERGENCE = 1e-8

export interface StableSwapPool {
  x: number       // balance of token 0 (e.g. USDC)
  y: number       // balance of token 1 (e.g. USDT)
  A: number       // amplification coefficient
  D: number       // the invariant
  feeRate: number  // e.g. 0.0004 for 0.04%
}

export interface StableSwapResult {
  amountOut: number
  priceImpact: number
  fee: number
  newX: number
  newY: number
  spotPriceBefore: number
  spotPriceAfter: number
  effectivePrice: number
}

export interface CurvePoint {
  x: number
  y: number
}

/**
 * Compute the StableSwap invariant D using Newton's method.
 *
 * The invariant:  A·n^n·S + D = A·n^n·D + D^(n+1)/(n^n·P)
 * where S = Σxᵢ, P = Πxᵢ
 *
 * Newton iteration:
 *   D_{k+1} = (Ann·S + n·D_P) · D_k / ((Ann - 1)·D_k + (n+1)·D_P)
 * where D_P = D^(n+1) / (n^n · Πxᵢ), computed iteratively.
 */
export function getD(balances: number[], A: number): number {
  const n = balances.length
  const Ann = A * n // In Curve's code, Ann = A * n_coins (not n^n)

  const S = balances.reduce((a, b) => a + b, 0)
  if (S === 0) return 0

  let D = S // initial guess
  let D_prev: number

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Compute D_P = D^(n+1) / (n^n · Πxᵢ)  iteratively
    let D_P = D
    for (let j = 0; j < n; j++) {
      D_P = (D_P * D) / (balances[j] * n)
    }

    D_prev = D
    // Newton step: D = (Ann·S + n·D_P) · D / ((Ann-1)·D + (n+1)·D_P)
    const numerator = (Ann * S + n * D_P) * D
    const denominator = (Ann - 1) * D + (n + 1) * D_P
    D = numerator / denominator

    if (Math.abs(D - D_prev) < CONVERGENCE) {
      return D
    }
  }

  return D
}

/**
 * Given token balances (excluding token j), the invariant D, and
 * amplification A, solve for the balance of token j using Newton's method.
 *
 * The invariant rearranged as a quadratic in y:
 *   y² + (b - D)·y - c = 0
 * where:
 *   b = S' + D/Ann   (S' = sum of other balances)
 *   c = D^(n+1) / (n^n · P' · Ann)  (P' = product of other balances)
 *
 * Newton iteration:
 *   y_{k+1} = (y_k² + c) / (2·y_k + b - D)
 */
export function getY(
  otherBalances: number[],
  A: number,
  D: number,
): number {
  const n = N_COINS
  const Ann = A * n

  // S' = sum of other token balances
  const S_ = otherBalances.reduce((a, b) => a + b, 0)

  // c = D^(n+1) / (n^n · P' · Ann)
  let c = D
  for (let i = 0; i < otherBalances.length; i++) {
    c = (c * D) / (otherBalances[i] * n)
  }
  c = (c * D) / (Ann * n)

  // b = S' + D/Ann
  const b = S_ + D / Ann

  // Newton's method starting from y = D
  let y = D
  let y_prev: number

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    y_prev = y
    y = (y * y + c) / (2 * y + b - D)

    if (Math.abs(y - y_prev) < CONVERGENCE) {
      return y
    }
  }

  return y
}

/**
 * Calculate a swap in the StableSwap pool.
 */
export function stableSwap(
  pool: StableSwapPool,
  amountIn: number,
  tokenInIdx: 0 | 1,
): StableSwapResult {
  const balances = [pool.x, pool.y]

  // Spot price before swap (dy/dx at current point)
  const spotPriceBefore = getSpotPrice(balances, pool.A, pool.D, tokenInIdx)

  // New balance of input token after adding amountIn
  const newInputBalance = balances[tokenInIdx] + amountIn

  // Solve for new output balance
  const otherBalances = [newInputBalance]
  const newOutputBalance = getY(otherBalances, pool.A, pool.D)

  // Raw output (before fee)
  const outputIdx = tokenInIdx === 0 ? 1 : 0
  const rawOut = balances[outputIdx] - newOutputBalance

  // Apply fee
  const fee = rawOut * pool.feeRate
  const amountOut = rawOut - fee

  // New balances after swap
  const newX = tokenInIdx === 0 ? newInputBalance : balances[0] - amountOut
  const newY = tokenInIdx === 1 ? newInputBalance : balances[1] - amountOut

  // Spot price after swap
  const spotPriceAfter = getSpotPrice([newX, newY], pool.A, pool.D, tokenInIdx)

  // Effective price = amountIn / amountOut
  const effectivePrice = amountIn / amountOut

  // Price impact
  const priceImpact = Math.abs(effectivePrice - spotPriceBefore) / spotPriceBefore * 100

  return {
    amountOut,
    priceImpact,
    fee,
    newX,
    newY,
    spotPriceBefore,
    spotPriceAfter,
    effectivePrice,
  }
}

/**
 * Compute the spot price (marginal exchange rate) at the current point
 * using finite differences: dy/dx ≈ (y(x) - y(x+ε)) / ε
 */
function getSpotPrice(
  balances: number[],
  A: number,
  D: number,
  tokenInIdx: 0 | 1,
): number {
  const eps = 0.001
  const outputIdx = tokenInIdx === 0 ? 1 : 0
  const otherCurrent = [balances[tokenInIdx]]
  const otherShifted = [balances[tokenInIdx] + eps]
  const yCurrent = getY(otherCurrent, A, D)
  const yShifted = getY(otherShifted, A, D)

  // Sanity: yCurrent should be very close to balances[outputIdx]
  void yCurrent
  return Math.abs(yCurrent - yShifted) / eps
}

/**
 * Generate the StableSwap bonding curve for given A and D.
 * Returns points (x, y) that satisfy the invariant.
 */
export function generateStableSwapCurve(
  A: number,
  D: number,
  numPoints: number = 200,
): CurvePoint[] {
  const points: CurvePoint[] = []

  // x ranges from near 0 to near D (full range)
  const minX = D * 0.005 // avoid division by zero
  const maxX = D * 0.995

  for (let i = 0; i <= numPoints; i++) {
    const x = minX + (maxX - minX) * (i / numPoints)
    const y = getY([x], A, D)
    if (y > 0 && isFinite(y)) {
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Generate the constant-product curve (Uniswap-style) for comparison.
 * x · y = k, where k = (D/2)² for a balanced pool with same D.
 */
export function generateConstantProductCurve(
  D: number,
  numPoints: number = 200,
): CurvePoint[] {
  const k = (D / 2) * (D / 2) // balanced pool
  const points: CurvePoint[] = []

  const minX = D * 0.005
  const maxX = D * 0.995

  for (let i = 0; i <= numPoints; i++) {
    const x = minX + (maxX - minX) * (i / numPoints)
    const y = k / x
    if (y > 0 && isFinite(y) && y < D * 2) {
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Generate the constant-sum line for comparison.
 * x + y = D
 */
export function generateConstantSumCurve(
  D: number,
  numPoints: number = 200,
): CurvePoint[] {
  const points: CurvePoint[] = []

  for (let i = 0; i <= numPoints; i++) {
    const x = (D * i) / numPoints
    const y = D - x
    if (y >= 0) {
      points.push({ x, y })
    }
  }

  return points
}

/**
 * Generate curves for multiple A values for comparison.
 */
export function generateMultiACurves(
  D: number,
  aValues: number[],
  numPoints: number = 200,
): { A: number; points: CurvePoint[] }[] {
  return aValues.map((A) => ({
    A,
    points: generateStableSwapCurve(A, D, numPoints),
  }))
}

/**
 * Create an initial StableSwap pool in equilibrium.
 */
export function createStableSwapPool(
  balance: number,
  A: number,
  feeRate: number = 0.0004,
): StableSwapPool {
  const x = balance
  const y = balance
  const D = getD([x, y], A)
  return { x, y, A, D, feeRate }
}

/**
 * Compute the virtual price of the pool (value of LP tokens).
 * Virtual price = D / total_supply. For our simulator, total_supply = initial D.
 */
export function getVirtualPrice(pool: StableSwapPool, initialD: number): number {
  const currentD = getD([pool.x, pool.y], pool.A)
  return currentD / initialD
}

/**
 * Compute pool imbalance ratio.
 * Returns 0 for perfectly balanced, higher for more imbalanced.
 */
export function getImbalanceRatio(pool: StableSwapPool): number {
  const total = pool.x + pool.y
  if (total === 0) return 0
  const ratio = pool.x / total
  return Math.abs(ratio - 0.5) * 200 // 0% at balanced, 100% at fully imbalanced
}
