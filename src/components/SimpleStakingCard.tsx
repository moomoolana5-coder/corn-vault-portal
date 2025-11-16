import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatUnits } from 'viem';
import {
  SimplePool,
  useUserStaked,
  usePendingReward,
  useTokenBalance,
  useAllowance,
  useApproveToken,
  useStake,
  useUnstake,
  useClaim,
} from '@/hooks/useSimpleStaking';
import { Loader2 } from 'lucide-react';

interface SimpleStakingCardProps {
  pool: SimplePool;
  walletAddress: `0x${string}` | undefined;
  isConnected: boolean;
  onRefresh?: () => void;
}

export function SimpleStakingCard({ pool, walletAddress, isConnected, onRefresh }: SimpleStakingCardProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');

  // Fetch user data
  const { staked, refetch: refetchStaked } = useUserStaked(pool.id, walletAddress);
  const { pending, refetch: refetchPending } = usePendingReward(pool.id, walletAddress);
  const { balance, refetch: refetchBalance } = useTokenBalance(pool.stakeToken, walletAddress);
  const { allowance, refetch: refetchAllowance } = useAllowance(pool.stakeToken, walletAddress);

  // Actions
  const { approve, isPending: isApproving, isSuccess: approveSuccess } = useApproveToken();
  const { stake, isPending: isStaking, isSuccess: stakeSuccess } = useStake();
  const { unstake, isPending: isUnstaking, isSuccess: unstakeSuccess } = useUnstake();
  const { claim, isPending: isClaiming, isSuccess: claimSuccess } = useClaim();

  // Refetch on success
  useEffect(() => {
    if (approveSuccess || stakeSuccess || unstakeSuccess || claimSuccess) {
      refetchStaked();
      refetchPending();
      refetchBalance();
      refetchAllowance();
      onRefresh?.();
    }
  }, [approveSuccess, stakeSuccess, unstakeSuccess, claimSuccess]);

  const handleApprove = () => {
    if (!stakeAmount) return;
    approve(pool.stakeToken, stakeAmount, pool.stakeDecimals);
  };

  const handleStake = () => {
    if (!stakeAmount) return;
    stake(pool.id, stakeAmount, pool.stakeDecimals);
    setStakeAmount('');
  };

  const handleUnstake = () => {
    if (!unstakeAmount) return;
    unstake(pool.id, unstakeAmount, pool.stakeDecimals);
    setUnstakeAmount('');
  };

  const handleClaim = () => {
    claim(pool.id);
  };

  const handleMaxStake = () => {
    if (balance) {
      setStakeAmount(formatUnits(balance, pool.stakeDecimals));
    }
  };

  const handleMaxUnstake = () => {
    if (staked) {
      setUnstakeAmount(formatUnits(staked, pool.stakeDecimals));
    }
  };

  const needsApproval = balance && allowance !== undefined && BigInt(allowance) < BigInt(balance);

  const stakedFormatted = staked ? formatUnits(staked, pool.stakeDecimals) : '0';
  const balanceFormatted = balance ? formatUnits(balance, pool.stakeDecimals) : '0';
  const pendingFormatted = pending ? formatUnits(pending, pool.rewardDecimals) : '0';
  const rewardRatePerDay = pool.rewardPerSecond ? formatUnits(BigInt(pool.rewardPerSecond) * BigInt(86400), pool.rewardDecimals) : '0';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Stake {pool.stakeName} earn {pool.rewardName}</span>
          {!pool.active && <span className="text-sm text-muted-foreground">Live Soon</span>}
        </CardTitle>
        <CardDescription>
          Reward Rate: {rewardRatePerDay} {pool.rewardName}/day
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-semibold">{parseFloat(balanceFormatted).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Staked</p>
                <p className="font-semibold">{parseFloat(stakedFormatted).toFixed(4)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Earned</p>
                <p className="font-semibold">{parseFloat(pendingFormatted).toFixed(4)}</p>
              </div>
            </div>

            <Tabs defaultValue="stake" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="unstake">Unstake</TabsTrigger>
              </TabsList>
              
              <TabsContent value="stake" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={!pool.active || isApproving || isStaking}
                    />
                    <Button
                      variant="outline"
                      onClick={handleMaxStake}
                      disabled={!pool.active || isApproving || isStaking}
                    >
                      Max
                    </Button>
                  </div>
                  
                  {needsApproval ? (
                    <Button
                      onClick={handleApprove}
                      disabled={!stakeAmount || isApproving || !pool.active}
                      className="w-full"
                    >
                      {isApproving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Approve
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStake}
                      disabled={!stakeAmount || isStaking || !pool.active}
                      className="w-full"
                    >
                      {isStaking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Stake
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="unstake" className="space-y-4">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      disabled={isUnstaking}
                    />
                    <Button
                      variant="outline"
                      onClick={handleMaxUnstake}
                      disabled={isUnstaking}
                    >
                      Max
                    </Button>
                  </div>
                  
                  <Button
                    onClick={handleUnstake}
                    disabled={!unstakeAmount || isUnstaking}
                    className="w-full"
                  >
                    {isUnstaking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Unstake
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleClaim}
              disabled={!pending || pending === 0n || isClaiming}
              variant="secondary"
              className="w-full"
            >
              {isClaiming && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Claim Rewards
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Connect your wallet to stake
          </div>
        )}
      </CardContent>
    </Card>
  );
}
