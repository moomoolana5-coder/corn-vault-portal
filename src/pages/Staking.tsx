import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { StakingPoolCard } from '@/components/StakingPoolCard';
import { useTokenMeta } from '@/hooks/useErc20';
import { CORN_ADDRESS, VECORN_ADDRESS, WPLS_ADDRESS, USDC_ADDRESS } from '@/lib/chains';
import { AlertCircle } from 'lucide-react';

const stakingPools = [
  { stakeToken: CORN_ADDRESS, earnToken: VECORN_ADDRESS, stakeSymbol: '🌽', earnSymbol: 'veCORN' },
  { stakeToken: CORN_ADDRESS, earnToken: WPLS_ADDRESS, stakeSymbol: '🌽', earnSymbol: 'WPLS' },
  { stakeToken: CORN_ADDRESS, earnToken: USDC_ADDRESS, stakeSymbol: '🌽', earnSymbol: 'USDC' },
  { stakeToken: VECORN_ADDRESS, earnToken: WPLS_ADDRESS, stakeSymbol: 'veCORN', earnSymbol: 'WPLS' },
  { stakeToken: USDC_ADDRESS, earnToken: CORN_ADDRESS, stakeSymbol: 'USDC', earnSymbol: '🌽' },
  { stakeToken: WPLS_ADDRESS, earnToken: CORN_ADDRESS, stakeSymbol: 'WPLS', earnSymbol: '🌽' },
];

export default function Staking() {
  const { address, isConnected } = useAccount();
  const cornMeta = useTokenMeta(CORN_ADDRESS);
  const veCornMeta = useTokenMeta(VECORN_ADDRESS);
  const wplsMeta = useTokenMeta(WPLS_ADDRESS);
  const usdcMeta = useTokenMeta(USDC_ADDRESS);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-corn bg-clip-text text-transparent">
              Staking Pools
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Stake your tokens to earn rewards across multiple pools
            </p>
          </div>

          {!isConnected && (
            <Card className="p-12 border-border/40 bg-gradient-card backdrop-blur-sm text-center max-w-md mx-auto shadow-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground mb-8">
                Please connect your wallet to access staking features
              </p>
              <w3m-button />
            </Card>
          )}

          {isConnected && (
            <>
              {/* Staking Pools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {stakingPools.map((pool, index) => {
                  const getTokenDecimals = (address: `0x${string}`) => {
                    if (address === CORN_ADDRESS) return cornMeta.decimals;
                    if (address === VECORN_ADDRESS) return veCornMeta.decimals;
                    if (address === WPLS_ADDRESS) return wplsMeta.decimals;
                    if (address === USDC_ADDRESS) return usdcMeta.decimals;
                    return undefined;
                  };

                  return (
                    <StakingPoolCard
                      key={`${pool.stakeToken}-${pool.earnToken}-${index}`}
                      stakeTokenAddress={pool.stakeToken}
                      earnTokenAddress={pool.earnToken}
                      stakeTokenSymbol={pool.stakeSymbol}
                      earnTokenSymbol={pool.earnSymbol}
                      stakeTokenDecimals={getTokenDecimals(pool.stakeToken)}
                      earnTokenDecimals={getTokenDecimals(pool.earnToken)}
                      walletAddress={address}
                    />
                  );
                })}
              </div>

              {/* Info Card */}
              <Card className="p-8 border-accent/20 bg-gradient-card backdrop-blur-sm shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-4 text-foreground">
                      Staking Information
                    </h4>
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>Choose from multiple staking pools with different reward tokens</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>Earn rewards from various token pairs</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>Stake and unstake anytime with no lock periods</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>Claim your rewards whenever you want</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5">•</span>
                        <span>All pools are non-custodial and secure</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
