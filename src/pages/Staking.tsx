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
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-corn bg-clip-text text-transparent">
            Staking Pools
          </h1>
          <p className="text-center text-muted-foreground mb-12">
            Stake tokens to earn rewards across multiple pools
          </p>

          {!isConnected && (
            <Card className="p-8 mb-8 border-border/50 bg-card/50 backdrop-blur-sm text-center">
              <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-foreground">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Please connect your wallet to access staking features.
              </p>
              <w3m-button />
            </Card>
          )}

          {isConnected && (
            <>
              {/* Staking Pools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <Card className="p-6 border-accent/20 bg-accent/5 backdrop-blur-sm">
                <h4 className="font-bold mb-3 text-foreground flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-accent" />
                  Staking Information
                </h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Choose from multiple staking pools with different reward tokens</li>
                  <li>• Earn rewards from various token pairs</li>
                  <li>• Stake and unstake anytime with no lock periods</li>
                  <li>• Claim your rewards whenever you want</li>
                  <li>• All pools are non-custodial and secure</li>
                </ul>
              </Card>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}
