import { useQuery } from '@tanstack/react-query';

interface DexScreenerToken {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: DexScreenerToken;
  quoteToken: DexScreenerToken;
  priceNative: string;
  priceUsd?: string;
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
}

interface DexScreenerResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[] | null;
}

export function useDexScreenerToken(address: string) {
  return useQuery({
    queryKey: ['dexscreener', address],
    queryFn: async () => {
      console.log(`Fetching token data for ${address} from DexScreener...`);
      
      const response = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${address}`
      );
      
      if (!response.ok) {
        console.error(`DexScreener API error for ${address}:`, response.status);
        throw new Error('Failed to fetch token data');
      }
      
      const data: DexScreenerResponse = await response.json();
      console.log(`DexScreener response for ${address}:`, data);
      
      // Find the pair with the most liquidity
      const pairs = data.pairs || [];
      if (pairs.length === 0) {
        console.warn(`No pairs found for ${address}`);
        return null;
      }
      
      const bestPair = pairs.reduce((best, current) => {
        const bestLiq = best.liquidity?.usd || 0;
        const currentLiq = current.liquidity?.usd || 0;
        return currentLiq > bestLiq ? current : best;
      });
      
      // Return the base token if it matches our address, otherwise quote token
      const token = bestPair.baseToken.address.toLowerCase() === address.toLowerCase()
        ? bestPair.baseToken
        : bestPair.quoteToken;
      
      console.log(`Token data for ${address}:`, {
        name: token.name,
        symbol: token.symbol,
        logo: token.logoURI,
      });
      
      return {
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        logo: token.logoURI,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}
