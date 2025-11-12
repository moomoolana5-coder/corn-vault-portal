import { useState, useEffect } from 'react';

// Virtual token prices for APR/TVL calculation
const TOKEN_PRICES: Record<string, number> = {
  CORN: 1.0,
  WPLS: 0.1,
  USDC: 1.0,
  veCORN: 1.0,
};

export function useTokenPrice(tokenAddress: string): number {
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const addr = tokenAddress.toLowerCase();
    
    // Map addresses to symbols
    if (addr === '0xd7661cce8eed01cbaa0188facdde2e46c4ebe4b0') {
      setPrice(TOKEN_PRICES.CORN);
    } else if (addr === '0xa1077a294dde1b09bb078844df40758a5d0f9a27') {
      setPrice(TOKEN_PRICES.WPLS);
    } else if (addr === '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07') {
      setPrice(TOKEN_PRICES.USDC);
    } else if (addr === '0x3facf37bc7d46fe899a3fe4991c3ee8a8e7ab489') {
      setPrice(TOKEN_PRICES.veCORN);
    } else {
      setPrice(0);
    }
  }, [tokenAddress]);

  return price;
}

export function calculateVirtualAPR(
  rewardsPerSecond: bigint,
  rewardTokenPrice: number,
  totalStaked: bigint,
  stakeTokenPrice: number,
  rewardDecimals: number,
  stakeDecimals: number
): number {
  if (totalStaked === 0n || stakeTokenPrice === 0) return 0;

  const rpsFloat = Number(rewardsPerSecond) / Math.pow(10, rewardDecimals);
  const tvlFloat = (Number(totalStaked) / Math.pow(10, stakeDecimals)) * stakeTokenPrice;
  
  const yearlyRewards = rpsFloat * 86400 * 365 * rewardTokenPrice;
  const apr = (yearlyRewards / tvlFloat) * 100;

  return isFinite(apr) ? apr : 0;
}

export function calculateVirtualTVL(
  totalStaked: bigint,
  tokenPrice: number,
  decimals: number
): number {
  const stakedFloat = Number(totalStaked) / Math.pow(10, decimals);
  return stakedFloat * tokenPrice;
}
