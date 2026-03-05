import { PoolState } from './mathEngine';

export interface SandwichStep {
  newPool: PoolState;
  amountOut: number;
}

export interface SandwichResult {
  step1FrontRun: SandwichStep & { attackerEthGained: number };
  step2Victim: SandwichStep & { victimEthReceived: number; expectedEth: number; slippageSuffered: number };
  step3BackRun: SandwichStep & { attackerUsdcReturned: number };
  attackerProfitUsdc: number;
  priceBeforeAttack: number;
  priceAfterFrontRun: number;
  priceAfterVictim: number;
  priceAfterBackRun: number;
}

/**
 * Simulates a sandwich attack on a constant-product AMM.
 *
 * Pool convention: tokenX = ETH, tokenY = USDC
 * The victim and attacker both buy ETH with USDC, so they add Y and remove X.
 */
export const calculateSandwichAttack = (
  initialPool: PoolState,
  victimUsdcIn: number,
  attackerUsdcIn: number,
  feeRate: number = 0.003
): SandwichResult => {
  const priceBeforeAttack = initialPool.tokenY / initialPool.tokenX;

  // ── STEP 1: Attacker Front-Runs (Buys ETH with USDC) ──
  const frontRunFee = attackerUsdcIn * feeRate;
  const frontRunEffective = attackerUsdcIn - frontRunFee;
  const poolAfterFR_Y = initialPool.tokenY + attackerUsdcIn;
  const poolAfterFR_X = initialPool.k / (initialPool.tokenY + frontRunEffective);
  const attackerEthGained = initialPool.tokenX - poolAfterFR_X;

  const poolState1: PoolState = {
    tokenX: poolAfterFR_X,
    tokenY: poolAfterFR_Y,
    k: poolAfterFR_X * poolAfterFR_Y,
    initialPrice: initialPool.initialPrice,
  };
  const priceAfterFrontRun = poolState1.tokenY / poolState1.tokenX;

  // ── STEP 2: Victim Executes (Buys ETH with USDC at worse price) ──
  const expectedEth = victimUsdcIn / priceBeforeAttack;
  const victimFee = victimUsdcIn * feeRate;
  const victimEffective = victimUsdcIn - victimFee;
  const poolAfterV_Y = poolState1.tokenY + victimUsdcIn;
  const poolAfterV_X = poolState1.k / (poolState1.tokenY + victimEffective);
  const victimEthReceived = poolState1.tokenX - poolAfterV_X;
  const slippageSuffered = ((expectedEth - victimEthReceived) / expectedEth) * 100;

  const poolState2: PoolState = {
    tokenX: poolAfterV_X,
    tokenY: poolAfterV_Y,
    k: poolAfterV_X * poolAfterV_Y,
    initialPrice: initialPool.initialPrice,
  };
  const priceAfterVictim = poolState2.tokenY / poolState2.tokenX;

  // ── STEP 3: Attacker Back-Runs (Sells ETH for USDC) ──
  const backRunFee = attackerEthGained * feeRate;
  const backRunEffective = attackerEthGained - backRunFee;
  const poolAfterBR_X = poolState2.tokenX + attackerEthGained;
  const poolAfterBR_Y = poolState2.k / (poolState2.tokenX + backRunEffective);
  const attackerUsdcReturned = poolState2.tokenY - poolAfterBR_Y;

  const poolState3: PoolState = {
    tokenX: poolAfterBR_X,
    tokenY: poolAfterBR_Y,
    k: poolAfterBR_X * poolAfterBR_Y,
    initialPrice: initialPool.initialPrice,
  };
  const priceAfterBackRun = poolState3.tokenY / poolState3.tokenX;

  const attackerProfitUsdc = attackerUsdcReturned - attackerUsdcIn;

  return {
    step1FrontRun: { newPool: poolState1, amountOut: attackerEthGained, attackerEthGained },
    step2Victim: { newPool: poolState2, amountOut: victimEthReceived, victimEthReceived, expectedEth, slippageSuffered },
    step3BackRun: { newPool: poolState3, amountOut: attackerUsdcReturned, attackerUsdcReturned },
    attackerProfitUsdc,
    priceBeforeAttack,
    priceAfterFrontRun,
    priceAfterVictim,
    priceAfterBackRun,
  };
};

/**
 * Finds the optimal front-run size that maximizes attacker profit
 * given a victim trade size, by scanning a range of attacker capital.
 */
export const findOptimalAttack = (
  initialPool: PoolState,
  victimUsdcIn: number,
  feeRate: number = 0.003,
  steps: number = 100
): { optimalAttackerUsdc: number; maxProfit: number; results: Array<{ capital: number; profit: number }> } => {
  const maxCapital = initialPool.tokenY * 0.5; // Max 50% of pool
  const stepSize = maxCapital / steps;
  let maxProfit = 0;
  let optimalAttackerUsdc = 0;
  const results: Array<{ capital: number; profit: number }> = [];

  for (let i = 1; i <= steps; i++) {
    const capital = stepSize * i;
    const result = calculateSandwichAttack(initialPool, victimUsdcIn, capital, feeRate);
    results.push({ capital, profit: result.attackerProfitUsdc });
    if (result.attackerProfitUsdc > maxProfit) {
      maxProfit = result.attackerProfitUsdc;
      optimalAttackerUsdc = capital;
    }
  }

  return { optimalAttackerUsdc, maxProfit, results };
};
