import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Clock, TrendingUp } from 'lucide-react';
import { formatUnits } from 'viem';
import { formatBalance } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { useAllPools, useUserPoolInfo, useClaimAll, useWithdraw, useEmergencyWithdraw, useHarvest } from '@/hooks/useStakingV2';
import { ADDR } from '@/config/addresses';
import { useEffect, useState } from 'react';

const TOKEN_DECIMALS: Record<string, number> = {
  [ADDR.corn.toLowerCase()]: 18,
  [ADDR.vecorn.toLowerCase()]: 18,
  [ADDR.wpls.toLowerCase()]: 18,
  [ADDR.usdc.toLowerCase()]: 6,
};

const TOKEN_SYMBOLS: Record<string, string> = {
  [ADDR.corn.toLowerCase()]: 'CORN',
  [ADDR.vecorn.toLowerCase()]: 'veCORN',
  [ADDR.wpls.toLowerCase()]: 'WPLS',
  [ADDR.usdc.toLowerCase()]: 'USDC',
};

export default function Portfolio() {
  const { address, isConnected } = useAccount();
  const { pools, isLoading: poolsLoading, refetch: refetchPools } = useAllPools();
  const { claimAll, isPending: isClaimingAll, isSuccess: claimAllSuccess } = useClaimAll();
  
  const [userInfos, setUserInfos] = useState<any[]>([]);

  // Fetch user info for all pools
  const pool0User = useUserPoolInfo(0, address);
  const pool1User = useUserPoolInfo(1, address);
  const pool2User = useUserPoolInfo(2, address);
  const pool3User = useUserPoolInfo(3, address);
  const pool4User = useUserPoolInfo(4, address);

  useEffect(() => {
    if (address) {
      setUserInfos([
        { pid: 0, ...pool0User },
        { pid: 1, ...pool1User },
        { pid: 2, ...pool2User },
        { pid: 3, ...pool3User },
        { pid: 4, ...pool4User },
      ]);
    }
  }, [address, pool0User.userInfo, pool1User.userInfo, pool2User.userInfo, pool3User.userInfo, pool4User.userInfo]);

  useEffect(() => {
    if (claimAllSuccess) {
      toast({ title: 'Claim All Successful', description: 'Claimed rewards from all pools' });
      refetchPools();
      pool0User.refetch();
      pool1User.refetch();
      pool2User.refetch();
      pool3User.refetch();
      pool4User.refetch();
    }
  }, [claimAllSuccess]);

  const handleClaimAll = async () => {
    const pidsWithRewards = userInfos
      .filter(ui => ui.userInfo && ui.userInfo.pendingReward > 0n)
      .map(ui => ui.pid);
    
    if (pidsWithRewards.length === 0) {
      toast({ title: 'No Rewards', description: 'No pending rewards to claim', variant: 'destructive' });
      return;
    }
    
    await claimAll(pidsWithRewards);
  };

  const formatLockTime = (seconds: number) => {
    if (seconds <= 0) return 'Unlocked';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const now = Math.floor(Date.now() / 1000);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-corn bg-clip-text text-transparent">
              My Portfolio
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View and manage all your staking positions
            </p>
          </div>

          {!isConnected ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Connect your wallet to view your portfolio</p>
              <w3m-button />
            </Card>
          ) : poolsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading portfolio...</p>
            </div>
          ) : (
            <>
              {/* Claim All Button */}
              <div className="mb-6 flex justify-end">
                <Button
                  onClick={handleClaimAll}
                  disabled={isClaimingAll}
                  className="gap-2"
                >
                  {isClaimingAll ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      Claim All Rewards
                    </>
                  )}
                </Button>
              </div>

              {/* Portfolio Table */}
              <Card className="border-accent/20 bg-gradient-card backdrop-blur-sm shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pool</TableHead>
                        <TableHead>Stake Token</TableHead>
                        <TableHead>Reward Token</TableHead>
                        <TableHead className="text-right">Staked Amount</TableHead>
                        <TableHead>Lock Status</TableHead>
                        <TableHead className="text-right">Pending Rewards</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pools.map((pool, idx) => {
                        const userInfo = userInfos[idx]?.userInfo;
                        const stakeDecimals = TOKEN_DECIMALS[pool.stakeToken.toLowerCase()] || 18;
                        const rewardDecimals = TOKEN_DECIMALS[pool.rewardToken.toLowerCase()] || 18;
                        const stakeSymbol = TOKEN_SYMBOLS[pool.stakeToken.toLowerCase()] || 'TOKEN';
                        const rewardSymbol = TOKEN_SYMBOLS[pool.rewardToken.toLowerCase()] || 'TOKEN';

                        const staked = userInfo ? formatUnits(userInfo.amount, stakeDecimals) : '0';
                        const pending = userInfo ? formatUnits(userInfo.pendingReward, rewardDecimals) : '0';
                        const lockEnd = userInfo ? Number(userInfo.lockEnd) : 0;
                        const isLocked = lockEnd > now;
                        const timeUntilUnlock = isLocked ? lockEnd - now : 0;

                        if (Number(staked) === 0) return null;

                        return (
                          <TableRow key={pool.pid}>
                            <TableCell className="font-medium">#{pool.pid}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{stakeSymbol}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-accent/10 border-accent/30">{rewardSymbol}</Badge>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatBalance(staked, 4)} {stakeSymbol}
                            </TableCell>
                            <TableCell>
                              {isLocked ? (
                                <Badge variant="outline" className="border-orange-500 text-orange-600 dark:text-orange-400 gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatLockTime(timeUntilUnlock)}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-green-500 text-green-600 dark:text-green-400">
                                  Unlocked
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium text-accent">
                              {formatBalance(pending, 6)} {rewardSymbol}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2 justify-center">
                                <PoolActions
                                  pid={pool.pid}
                                  isLocked={isLocked}
                                  staked={staked}
                                  stakeDecimals={stakeDecimals}
                                  onSuccess={() => {
                                    refetchPools();
                                    userInfos[idx].refetch();
                                  }}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          )}

          <Footer />
        </div>
      </div>
    </div>
  );
}

interface PoolActionsProps {
  pid: number;
  isLocked: boolean;
  staked: string;
  stakeDecimals: number;
  onSuccess: () => void;
}

function PoolActions({ pid, isLocked, staked, stakeDecimals, onSuccess }: PoolActionsProps) {
  const { harvest, isPending: isHarvesting, isSuccess: harvestSuccess } = useHarvest();
  const { withdraw, isPending: isWithdrawing, isSuccess: withdrawSuccess } = useWithdraw();
  const { emergencyWithdraw, isPending: isEmergency, isSuccess: emergencySuccess } = useEmergencyWithdraw();

  useEffect(() => {
    if (harvestSuccess || withdrawSuccess || emergencySuccess) {
      toast({ 
        title: 'Action Successful',
        description: emergencySuccess ? 'Emergency withdraw completed' : withdrawSuccess ? 'Unstaked successfully' : 'Claimed rewards'
      });
      onSuccess();
    }
  }, [harvestSuccess, withdrawSuccess, emergencySuccess]);

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => harvest(pid)}
        disabled={isHarvesting || isLocked}
      >
        {isHarvesting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Claim'}
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => withdraw(pid, staked, stakeDecimals)}
        disabled={isWithdrawing || isLocked}
      >
        {isWithdrawing ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Unstake'}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => emergencyWithdraw(pid)}
        disabled={isEmergency}
      >
        {isEmergency ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Emergency'}
      </Button>
    </>
  );
}
