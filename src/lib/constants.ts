/* ── Chart styling ── */
export const CHART_MARGIN = { top: 10, right: 16, bottom: 10, left: 10 } as const
export const CHART_GRID = "#132d30"
export const CHART_AXIS = "#3b6b6b"
export const CHART_TICK = { fontSize: 10, fill: "#3b6b6b" } as const
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "#071115",
  border: "1px solid #132d30",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#f0fdf4",
} as const

/* ── Pool defaults ── */
export const DEFAULT_AMM_POOL = {
  tokenX: 10,
  tokenY: 20_000,
  k: 200_000,
  initialPrice: 2_000,
} as const

export const DEFAULT_MEV_POOL = {
  tokenX: 100,
  tokenY: 200_000,
  k: 20_000_000,
  initialPrice: 2_000,
} as const

export const DEFAULT_FEE_RATE = 0.003
export const MEV_OPTIMAL_STEPS = 80
export const FLASH_LOAN_BASE_ETH = 100
export const FLASH_LOAN_BASE_USDC = 200_000
export const FLASH_LOAN_MAX_BORROW = 150_000
export const AAVE_FEE_RATE = 0.0009
export const ETH_PRICE_USD = 2_000

/* ── Gas cost layer ── */
export const GAS_PRICE_GWEI = 30
export const GAS_ETH_PRICE = 2_000
export const GAS_COSTS = {
  swap: 150_000,        // single AMM swap
  flashLoan: 400_000,   // flash loan + 2 swaps
  sandwich: 350_000,    // front-run + back-run
} as const

export const gasToUSD = (gasUnits: number, gasPriceGwei: number = GAS_PRICE_GWEI): number =>
  (gasUnits * gasPriceGwei * 1e-9) * GAS_ETH_PRICE

/* ── Theme tokens (used inline where CSS vars aren't enough) ── */
export const THEME = {
  card: "#071115",
  border: "#132d30",
  muted: "#0f1d24",
  mutedFg: "#6b8a99",
  primary: "#14b8a6",    // teal-500
  primaryLight: "#2dd4bf", // teal-400
  accent: "#f59e0b",     // amber-500
  cyan: "#22d3ee",       // cyan-400
  success: "#22c55e",
  danger: "#f43f5e",
  rose: "#fb7185",
} as const
