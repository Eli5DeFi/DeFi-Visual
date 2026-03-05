import { PoolState } from './mathEngine'; // Reusing our CPMM logic

export interface FlashLoanResult {
  borrowAmount: number;
  repaymentRequired: number;
  ethFromUni: number;
  usdcFromSushi: number;
  profit: number;
  isReverted: boolean;
  revertReason?: string;
}

export const calculateFlashLoan = (
  borrowAmountUsdc: number,
  uniPool: PoolState,
  sushiPool: PoolState,
  aaveFeeRate: number = 0.0009, // 0.09% Aave Flash Loan Fee
  dexFeeRate: number = 0.003    // 0.3% Standard AMM Fee
): FlashLoanResult => {

  // 1. Calculate the exact amount we MUST return to Aave at the end of the block
  const flashLoanFee = borrowAmountUsdc * aaveFeeRate;
  const repaymentRequired = borrowAmountUsdc + flashLoanFee;

  // 2. Leg 1: Buy ETH on Uniswap with borrowed USDC
  const uniUsdcInWithFee = borrowAmountUsdc * (1 - dexFeeRate);
  const newUniEth = uniPool.k / (uniPool.tokenY + uniUsdcInWithFee);
  const ethFromUni = uniPool.tokenX - newUniEth;

  // 3. Leg 2: Sell that ETH on SushiSwap for USDC
  const sushiEthInWithFee = ethFromUni * (1 - dexFeeRate);
  const newSushiUsdc = sushiPool.k / (sushiPool.tokenX + sushiEthInWithFee);
  const usdcFromSushi = sushiPool.tokenY - newSushiUsdc;

  // 4. The Final Check: Do we have enough to repay?
  const profit = usdcFromSushi - repaymentRequired;
  const isReverted = profit < 0;

  return {
    borrowAmount: borrowAmountUsdc,
    repaymentRequired,
    ethFromUni,
    usdcFromSushi,
    profit,
    isReverted,
    revertReason: isReverted ? `Short by ${Math.abs(profit).toFixed(2)} USDC` : undefined
  };
};
