import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StakingPoolCard } from '@/components/StakingPoolCard';
import { PriceIndicator } from '@/components/PriceIndicator';
import { useAllPools } from '@/hooks/useStakingPools';
import { AlertCircle, Coins } from 'lucide-react';
import { formatUnits } from 'viem';
import { useTokenMeta } from '@/hooks/useErc20';
import { formatBalance, compactNumber } from '@/lib/format';
import { ADDR } from '@/config/addresses';

export default function Staking() {
  const { address, isConnected } = useAccount();
  const { pools, isLoading: poolsLoading, refetch } = useAllPools();


  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 px-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/10 border-primary/30">
                <Coins className="w-3 h-3 mr-1" />
                PulseChain • Mainnet (369)
              </Badge>
              <PriceIndicator tokenAddress={ADDR.wpls} />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-corn bg-clip-text text-transparent">
              Staking Pools
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Stake your tokens to earn rewards across multiple pools
            </p>
            
            {/* Stats */}
            {isConnected && pools.length > 0 && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-6 px-6 py-3 rounded-lg bg-background/60 border border-border/40">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Pools</p>
                    <p className="text-lg font-bold">{pools.filter(p => !p.paused).length}</p>
                  </div>
                  <div className="h-8 w-px bg-border/40" />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Pools</p>
                    <p className="text-lg font-bold">{pools.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Staking Pools Grid */}
          {poolsLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading pools...</p>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No staking pools available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
              {pools.map((pool) => (
                <StakingPoolCard
                  key={pool.pid}
                  pid={pool.pid}
                  walletAddress={address}
                  isConnected={isConnected}
                  onRefresh={refetch}
                />
              ))}
            </div>
          )}

          {/* Info Card */}
          <Card className="p-6 md:p-8 border-accent/20 bg-gradient-card backdrop-blur-sm shadow-lg">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-foreground">
                  Staking Information
                </h4>
                <ul className="space-y-2 md:space-y-3 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>Pools are dynamically loaded from on-chain contract data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                    <span><strong className="text-green-600 dark:text-green-400">Live Price</strong>: Real-time token prices from DexScreener API (fallback to virtual prices if unavailable)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>APR/TVL calculations use live market prices for accurate metrics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 font-bold mt-0.5 flex-shrink-0">⚠</span>
                    <span><strong className="text-yellow-600 dark:text-yellow-400">Pools marked "Not Active"</strong> need rewards configuration by contract admin before earning begins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>Stake and unstake anytime; pools may have different reward schedules</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>Paused pools allow withdrawals but not deposits or harvests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                    <span>All interactions are non-custodial and secured by smart contracts</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
