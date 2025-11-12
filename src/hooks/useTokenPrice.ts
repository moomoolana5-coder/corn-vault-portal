import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

// Virtual token prices sebagai fallback
const FALLBACK_PRICES: Record<string, number> = {
  CORN: 1.0,
  WPLS: 0.1,
  USDC: 1.0,
  veCORN: 1.0,
};

interface DexScreenerPair {
  priceUsd?: string;
  liquidity?: { usd?: number };
}

interface DexScreenerResponse {
  pairs: DexScreenerPair[] | null;
}

async function fetchTokenPrice(tokenAddress: string): Promise<number> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );
    
    if (!response.ok) {
      throw new Error('DexScreener API error');
    }
    
    const data: DexScreenerResponse = await response.json();
    const pairs = data.pairs || [];
    
    if (pairs.length === 0) {
      throw new Error('No pairs found');
    }
    
    // Find pair dengan liquidity tertinggi
    const bestPair = pairs.reduce((best, current) => {
      const bestLiq = best.liquidity?.usd || 0;
      const currentLiq = current.liquidity?.usd || 0;
      return currentLiq > bestLiq ? current : best;
    });
    
    const priceUsd = parseFloat(bestPair.priceUsd || '0');
    
    if (!priceUsd || priceUsd <= 0) {
      throw new Error('Invalid price');
    }
    
    return priceUsd;
  } catch (error) {
    console.warn(`Failed to fetch price for ${tokenAddress}:`, error);
    throw error;
  }
}

export function useTokenPrice(tokenAddress: string): number {
  const addr = tokenAddress.toLowerCase();
  
  // Map address ke symbol untuk fallback
  let fallbackSymbol = '';
  if (addr === '0xd7661cce8eed01cbaa0188facdde2e46c4ebe4b0') fallbackSymbol = 'CORN';
  else if (addr === '0xa1077a294dde1b09bb078844df40758a5d0f9a27') fallbackSymbol = 'WPLS';
  else if (addr === '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07') fallbackSymbol = 'USDC';
  else if (addr === '0x3facf37bc7d46fe899a3fe4991c3ee8a8e7ab489') fallbackSymbol = 'veCORN';

  const { data: price } = useQuery({
    queryKey: ['token-price', addr],
    queryFn: () => fetchTokenPrice(tokenAddress),
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    retry: 1,
    enabled: !!tokenAddress && tokenAddress !== '0x0',
  });

  // Return real price jika ada, fallback ke virtual price
  if (price && price > 0) {
    return price;
  }
  
  return FALLBACK_PRICES[fallbackSymbol] || 0;
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
