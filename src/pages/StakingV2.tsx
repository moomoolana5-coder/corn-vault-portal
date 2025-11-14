import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StakingPoolCardV2 } from '@/components/StakingPoolCardV2';
import { PriceIndicator } from '@/components/PriceIndicator';
import { useAllPoolsV3 } from '@/hooks/useStakingV3';
import { AlertCircle, Coins } from 'lucide-react';
import { ADDR } from '@/config/addresses';

export default function StakingV2() {
  const { address, isConnected } = useAccount();
  const { pools, isLoading: poolsLoading, refetch } = useAllPoolsV3();

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
              Stake your tokens to earn USDC rewards across 2 pools
            </p>
            
            {/* Stats */}
            {isConnected && pools.length > 0 && (
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-6 px-6 py-3 rounded-lg bg-background/60 border border-border/40">
                  <div>
                    <p className="text-xs text-muted-foreground">Active Pools</p>
                    <p className="text-lg font-bold">{pools.filter(p => p.active).length}</p>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
              {pools.map((pool) => (
                <StakingPoolCardV2
                  key={pool.pid}
                  pool={pool}
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

                <div className="pt-2">
                  <h5 className="text-sm md:text-base font-semibold mb-3 text-foreground">
                    📊 APR & TVL Calculations
                  </h5>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <li>• <strong className="text-foreground">APR Formula:</strong> (Rewards Per Second × Seconds Per Year × Reward Token Price) ÷ (Total Staked × Stake Token Price) × 100</li>
                    <li>• <strong className="text-foreground">TVL Calculation:</strong> Total Staked × Stake Token Price</li>
                    <li>• Prices are fetched from DexScreener API for real-time accuracy</li>
                    <li>• Virtual prices from Moralis are used as fallback when DexScreener data is unavailable</li>
                  </ul>
                </div>

                <div className="pt-6">
                  <h5 className="text-sm md:text-base font-semibold mb-3 text-foreground">
                    🔒 How Staking Works
                  </h5>
                  <ol className="space-y-2 text-xs md:text-sm text-muted-foreground list-decimal list-inside">
                    <li><strong className="text-foreground">Connect Wallet:</strong> Connect your PulseChain wallet to access the pools</li>
                    <li><strong className="text-foreground">Select Lock Period:</strong> Choose how long to lock your tokens (1-30 days)</li>
                    <li><strong className="text-foreground">Deposit Tokens:</strong> Stake your tokens into the desired pool</li>
                    <li><strong className="text-foreground">Wait Lock Period:</strong> Your tokens will be locked for the selected duration</li>
                    <li><strong className="text-foreground">Earn Rewards:</strong> Rewards accumulate over time based on the pool's RPS (Rewards Per Second)</li>
                    <li><strong className="text-foreground">Claim & Unstake:</strong> After the lock period, claim rewards and/or unstake your tokens</li>
                  </ol>
                </div>

                <div className="pt-6">
                  <h5 className="text-sm md:text-base font-semibold mb-3 text-foreground">
                    ⚠️ Important Lock Period Rules
                  </h5>
                  <ul className="space-y-2 text-xs md:text-sm text-muted-foreground">
                    <li>• <strong className="text-foreground">No Early Unstake:</strong> You cannot unstake tokens before the lock period ends</li>
                    <li>• <strong className="text-foreground">No Early Claims:</strong> You cannot claim rewards before the lock period ends</li>
                    <li>• <strong className="text-foreground">Emergency Withdraw:</strong> Available anytime but forfeits all pending rewards</li>
                    <li>• <strong className="text-foreground">Choose Wisely:</strong> Select a lock period you're comfortable with as it cannot be changed</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
