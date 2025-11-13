import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StakingPoolCardV2 } from '@/components/StakingPoolCardV2';
import { PriceIndicator } from '@/components/PriceIndicator';
import { useAllPools } from '@/hooks/useStakingV2';
import { AlertCircle, Coins } from 'lucide-react';
import { ADDR } from '@/config/addresses';

export default function StakingV2() {
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
              Stake your tokens to earn rewards across 5 pools
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
                  <div className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                    <div>
                      <strong className="text-foreground">APR (Annual Percentage Rate):</strong>
                      <p className="mt-1 ml-4">APR = (Yearly Rewards Value / Total Staked Value) × 100</p>
                      <p className="mt-1 ml-4">• Yearly Rewards = Rewards Per Second × 86,400 seconds × 365 days × Reward Token Price</p>
                      <p className="mt-1 ml-4">• Higher APR means better returns on your staked tokens</p>
                      <p className="mt-1 ml-4">• APR fluctuates based on total staked amount and token prices</p>
                    </div>
                    
                    <div>
                      <strong className="text-foreground">TVL (Total Value Locked):</strong>
                      <p className="mt-1 ml-4">TVL = Total Staked Tokens × Token Price (USD)</p>
                      <p className="mt-1 ml-4">• Shows the total USD value locked in the pool</p>
                      <p className="mt-1 ml-4">• Higher TVL indicates more user confidence and liquidity</p>
                      <p className="mt-1 ml-4">• TVL affects APR inversely: higher TVL = lower APR</p>
                    </div>

                    <div>
                      <strong className="text-foreground">How Staking Works:</strong>
                      <p className="mt-1 ml-4">1. <strong>Select Lock Period</strong>: Choose lock duration (1-30 days) before staking</p>
                      <p className="mt-1 ml-4">2. <strong>Deposit</strong>: Lock your tokens in the pool contract for chosen duration</p>
                      <p className="mt-1 ml-4">3. <strong>Earn</strong>: Rewards accumulate every second based on pool's RPS (Rewards Per Second)</p>
                      <p className="mt-1 ml-4">4. <strong>Wait Lock Period</strong>: Cannot claim or unstake until lock period ends</p>
                      <p className="mt-1 ml-4">5. <strong>Claim After Unlock</strong>: Harvest your rewards once lock period expires</p>
                      <p className="mt-1 ml-4">6. <strong>Withdraw After Unlock</strong>: Unstake your tokens after lock period (automatically claims pending rewards)</p>
                    </div>

                    <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-md mt-4">
                      <strong className="text-orange-600 dark:text-orange-400">⚠️ Important Lock Period Rules:</strong>
                      <p className="mt-2 ml-4">• You <strong>must</strong> choose a lock duration (1-30 days) before staking</p>
                      <p className="mt-1 ml-4">• During lock period: <strong>NO unstaking, NO claiming rewards</strong></p>
                      <p className="mt-1 ml-4">• After lock expires: Full access to unstake and claim</p>
                      <p className="mt-1 ml-4">• Countdown timer shows remaining lock time</p>
                      <p className="mt-1 ml-4">• Plan your lock duration carefully based on your needs</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Footer />
      </div>
    </div>
  );
}
