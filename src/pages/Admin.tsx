import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AdminPoolCard } from '@/components/AdminPoolCard';
import { useAllPools } from '@/hooks/useStakingPools';
import { useIsOwner } from '@/hooks/useStakingAdmin';
import { AlertCircle, ShieldAlert, Settings } from 'lucide-react';

export default function Admin() {
  const { address, isConnected } = useAccount();
  const { pools, isLoading: poolsLoading, refetch } = useAllPools();
  const { isOwner, isLoading: ownerLoading, ownerAddress } = useIsOwner();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12 px-4">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Badge variant="outline" className="bg-primary/10 border-primary/30">
                <Settings className="w-3 h-3 mr-1" />
                Admin Panel
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4 bg-gradient-corn bg-clip-text text-transparent">
              Staking Pool Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-6">
              Configure rewards, end times, and pool status
            </p>
          </div>

          {/* Access Control */}
          {!isConnected ? (
            <Card className="p-8 md:p-12 text-center border-accent/20 bg-gradient-card backdrop-blur-sm">
              <ShieldAlert className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground mb-6">
                Connect your wallet to access the admin panel
              </p>
              <w3m-button />
            </Card>
          ) : ownerLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Verifying permissions...</p>
            </div>
          ) : !isOwner ? (
            <Card className="p-8 md:p-12 text-center border-destructive/20 bg-gradient-card backdrop-blur-sm">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
              <h3 className="text-xl font-bold mb-2">Access Denied</h3>
              <p className="text-muted-foreground mb-4">
                Only the contract owner can access this panel
              </p>
              <div className="p-4 rounded-lg bg-background/60 border border-border/40 max-w-md mx-auto">
                <p className="text-xs text-muted-foreground mb-1">Your Address:</p>
                <p className="text-sm font-mono break-all">{address}</p>
                <p className="text-xs text-muted-foreground mb-1 mt-3">Owner Address:</p>
                <p className="text-sm font-mono break-all">{ownerAddress}</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Owner Info */}
              <Card className="p-4 md:p-6 mb-8 border-accent/20 bg-gradient-card backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-accent" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">Owner Access Granted</p>
                    <p className="text-xs text-muted-foreground font-mono">{address}</p>
                  </div>
                  <Badge variant="default">Admin</Badge>
                </div>
              </Card>

              {/* Pool Management Grid */}
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
                    <AdminPoolCard key={pool.pid} pid={pool.pid} onRefresh={refetch} />
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
                      Admin Guidelines
                    </h4>
                    <ul className="space-y-2 md:space-y-3 text-xs sm:text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                        <span><strong>Rewards Per Second (RPS)</strong>: Set the emission rate in reward token units per second</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                        <span><strong>End Time</strong>: Set when reward distribution should stop for a pool</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                        <span><strong>Pause Pool</strong>: Temporarily disable deposits and harvests (withdrawals still allowed)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 font-bold mt-0.5 flex-shrink-0">⚠</span>
                        <span>Make sure the staking contract has sufficient reward tokens before activating pools</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-500 font-bold mt-0.5 flex-shrink-0">⚠</span>
                        <span>Changing RPS affects future rewards but does not retroactively modify earned rewards</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-accent font-bold mt-0.5 flex-shrink-0">•</span>
                        <span>All changes are on-chain and require wallet transaction confirmation</span>
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
