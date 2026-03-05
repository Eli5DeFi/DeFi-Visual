export interface PoolState {
  tokenX: number;
  tokenY: number;
  k: number;
  initialPrice: number;
}

export interface SwapResult {
  newState: PoolState;
  amountOut: number;
  priceImpact: number;
  impermanentLoss: number;
  newPrice: number;
  feeEarned: number;
}

export interface LPPosition {
  initialValueUSD: number;
  currentLPValue: number;
  holdValue: number;
  impermanentLoss: number;
  ilPercent: number;
  feesEarned: number;
}

export const createPool = (tokenX: number, tokenY: number): PoolState => {
  return {
    tokenX,
    tokenY,
    k: tokenX * tokenY,
    initialPrice: tokenY / tokenX,
  };
};

export const calculateSwap = (
  currentState: PoolState,
  amountInX: number,
  feeRate: number = 0.003
): SwapResult => {
  const { tokenX, tokenY, k, initialPrice } = currentState;

  // Calculate input with fee
  const feeAmount = amountInX * feeRate;
  const amountInWithFee = amountInX - feeAmount;

  // New Token X balance (for output calculation, use amount after fee)
  const newTokenXForCalc = tokenX + amountInWithFee;

  // New Token Y balance to maintain k
  const newTokenY = k / newTokenXForCalc;

  // Amount user receives
  const amountOutY = tokenY - newTokenY;

  // Actual new pool state (k grows slightly due to fees)
  const actualNewTokenX = tokenX + amountInX;
  const newK = actualNewTokenX * newTokenY;
  const newPrice = newTokenY / actualNewTokenX;

  // Impermanent Loss
  const priceRatio = newPrice / initialPrice;
  const impermanentLossPercent =
    ((2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1) * 100;

  // Price Impact
  const expectedPrice = tokenY / tokenX;
  const executionPrice = amountOutY / amountInX;
  const priceImpact = (1 - executionPrice / expectedPrice) * 100;

  return {
    newState: {
      tokenX: actualNewTokenX,
      tokenY: newTokenY,
      k: newK,
      initialPrice,
    },
    amountOut: amountOutY,
    priceImpact,
    impermanentLoss: impermanentLossPercent,
    newPrice,
    feeEarned: feeAmount * (tokenY / tokenX),
  };
};

export const calculateSwapYtoX = (
  currentState: PoolState,
  amountInY: number,
  feeRate: number = 0.003
): SwapResult => {
  const { tokenX, tokenY, k, initialPrice } = currentState;

  const feeAmount = amountInY * feeRate;
  const amountInWithFee = amountInY - feeAmount;

  const newTokenYForCalc = tokenY + amountInWithFee;
  const newTokenX = k / newTokenYForCalc;
  const amountOutX = tokenX - newTokenX;

  const actualNewTokenY = tokenY + amountInY;
  const newK = newTokenX * actualNewTokenY;
  const newPrice = actualNewTokenY / newTokenX;

  const priceRatio = newPrice / initialPrice;
  const impermanentLossPercent =
    ((2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1) * 100;

  const expectedPrice = tokenX / tokenY;
  const executionPrice = amountOutX / amountInY;
  const priceImpact = (1 - executionPrice / expectedPrice) * 100;

  return {
    newState: {
      tokenX: newTokenX,
      tokenY: actualNewTokenY,
      k: newK,
      initialPrice,
    },
    amountOut: amountOutX,
    priceImpact,
    impermanentLoss: impermanentLossPercent,
    newPrice,
    feeEarned: feeAmount,
  };
};

export const calculateILForPriceChange = (priceRatio: number): number => {
  return ((2 * Math.sqrt(priceRatio)) / (1 + priceRatio) - 1) * 100;
};

export const generateILCurve = (): { priceChange: number; il: number }[] => {
  const points: { priceChange: number; il: number }[] = [];
  for (let i = -90; i <= 900; i += 5) {
    const priceRatio = 1 + i / 100;
    if (priceRatio <= 0) continue;
    const il = calculateILForPriceChange(priceRatio);
    points.push({
      priceChange: i,
      il: Math.abs(il),
    });
  }
  return points;
};

export const getConstantProductCurve = (
  k: number,
  currentX: number
): { x: number; y: number }[] => {
  const points: { x: number; y: number }[] = [];
  const minX = Math.max(0.5, currentX * 0.1);
  const maxX = currentX * 5;
  const steps = 200;
  const step = (maxX - minX) / steps;

  for (let x = minX; x <= maxX; x += step) {
    points.push({ x, y: k / x });
  }
  return points;
};
