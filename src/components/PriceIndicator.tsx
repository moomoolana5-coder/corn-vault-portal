import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface PriceIndicatorProps {
  tokenAddress: string;
  className?: string;
}

async function checkPriceAvailability(tokenAddress: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );
    
    if (!response.ok) return false;
    
    const data = await response.json();
    const pairs = data.pairs || [];
    
    if (pairs.length === 0) return false;
    
    const bestPair = pairs.reduce((best: any, current: any) => {
      const bestLiq = best.liquidity?.usd || 0;
      const currentLiq = current.liquidity?.usd || 0;
      return currentLiq > bestLiq ? current : best;
    });
    
    const priceUsd = parseFloat(bestPair.priceUsd || '0');
    return !!(priceUsd && priceUsd > 0);
  } catch {
    return false;
  }
}

export function PriceIndicator({ tokenAddress, className = '' }: PriceIndicatorProps) {
  const { data: hasRealPrice, isLoading } = useQuery({
    queryKey: ['price-status', tokenAddress.toLowerCase()],
    queryFn: () => checkPriceAvailability(tokenAddress),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  if (isLoading) return null;

  if (hasRealPrice) {
    return (
      <Badge variant="outline" className={`bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 ${className}`}>
        <TrendingUp className="w-3 h-3 mr-1" />
        Live Price
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={`bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400 ${className}`}>
      <AlertCircle className="w-3 h-3 mr-1" />
      Virtual Price
    </Badge>
  );
}
