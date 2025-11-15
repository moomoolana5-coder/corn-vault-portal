import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAllPoolsV3, useIsOwnerV3 } from '@/hooks/useStakingV3';
import { useSetRewardsPerSecondV3, useSetEndTimeV3, useSetActiveV3 } from '@/hooks/useStakingAdminV3';
import { AlertCircle, ShieldAlert, Settings } from 'lucide-react';
import { useState } from 'react';
import { formatUnits, parseUnits } from 'viem';
import { toast } from 'sonner';
import { ADDR } from '@/config/addresses';

export default function AdminV3() {
  const { address, isConnected } = useAccount();
  const { pools, isLoading: poolsLoading, refetch } = useAllPoolsV3();
  const { isOwner, isLoading: ownerLoading } = useIsOwnerV3();

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
                Admin Panel V3
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
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pools.map((pool) => (
                    <PoolAdminCard key={pool.pid} pool={pool} onUpdate={refetch} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

function PoolAdminCard({ pool, onUpdate }: { pool: any; onUpdate: () => void }) {
  const [rps, setRps] = useState('');
  const [endTime, setEndTime] = useState('');
  
  const { setRewardsPerSecond, isPending: rpsLoading } = useSetRewardsPerSecondV3();
  const { setEndTime: setEndTimeFn, isPending: endTimeLoading } = useSetEndTimeV3();
  const { setActive, isPending: activeLoading } = useSetActiveV3();

  const stakeTokenSymbol = pool.pid === 0 ? 'CORN' : 'xCORN';

  const handleSetRPS = async () => {
    if (!rps) {
      toast.error('Please enter RPS value');
      return;
    }
    try {
      await setRewardsPerSecond(pool.pid, rps);
      toast.success('RPS updated successfully');
      setRps('');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update RPS');
    }
  };

  const handleSetEndTime = async () => {
    if (!endTime) {
      toast.error('Please select end time');
      return;
    }
    try {
      const timestamp = Math.floor(new Date(endTime).getTime() / 1000);
      await setEndTimeFn(pool.pid, timestamp);
      toast.success('End time updated successfully');
      setEndTime('');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to update end time');
    }
  };

  const handleToggleActive = async () => {
    try {
      await setActive(pool.pid, !pool.active);
      toast.success(pool.active ? 'Pool deactivated' : 'Pool activated');
      onUpdate();
    } catch (error: any) {
      toast.error(error?.message || 'Failed to toggle pool status');
    }
  };

  return (
    <Card className="border-accent/20 bg-gradient-card backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">Pool #{pool.pid}</CardTitle>
            <CardDescription>Stake {stakeTokenSymbol} earn USDC</CardDescription>
          </div>
          <Badge variant={pool.active ? "default" : "secondary"}>
            {pool.active ? "Active" : "Not Active"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pool Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Staked</p>
            <p className="text-lg font-bold">{formatUnits(pool.totalStaked, 18)} {stakeTokenSymbol}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Current RPS</p>
            <p className="text-lg font-bold">{formatUnits(pool.rps, 6)} USDC/s</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">End Time</p>
            <p className="text-sm font-mono">
              {pool.endTime === 0n ? 'Not Set' : new Date(Number(pool.endTime) * 1000).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Set RPS */}
        <div className="space-y-2">
          <Label>Set Rewards Per Second (USDC/s)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.000001"
              placeholder="0.00001"
              value={rps}
              onChange={(e) => setRps(e.target.value)}
            />
            <Button onClick={handleSetRPS} disabled={rpsLoading}>
              {rpsLoading ? 'Setting...' : 'Set RPS'}
            </Button>
          </div>
        </div>

        {/* Set End Time */}
        <div className="space-y-2">
          <Label>Set End Time</Label>
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <Button onClick={handleSetEndTime} disabled={endTimeLoading}>
              {endTimeLoading ? 'Setting...' : 'Set Time'}
            </Button>
          </div>
        </div>

        {/* Toggle Active */}
        <Button 
          onClick={handleToggleActive} 
          disabled={activeLoading}
          variant={pool.active ? "destructive" : "default"}
          className="w-full"
        >
          {activeLoading ? 'Processing...' : pool.active ? 'Deactivate Pool' : 'Activate Pool'}
        </Button>
      </CardContent>
    </Card>
  );
}
