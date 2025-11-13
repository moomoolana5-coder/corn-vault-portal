import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, TrendingUp, Lock, Clock } from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';
import { formatBalance, compactNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { useDeposit, useWithdraw, useHarvest, useUserPoolInfo, PoolInfoV2 } from '@/hooks/useStakingV2';
import { useTokenApproval } from '@/hooks/useStakingActions';
import { useTokenMeta, useFormattedBalance } from '@/hooks/useErc20';
import { useTokenPrice, calculateVirtualAPR, calculateVirtualTVL } from '@/hooks/useTokenPrice';
import { ADDR } from '@/config/addresses';

interface StakingPoolCardV2Props {
  pool: PoolInfoV2;
  walletAddress: `0x${string}` | undefined;
  isConnected: boolean;
  onRefresh?: () => void;
}

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

const LOCK_OPTIONS = [
  { label: '1 Day', seconds: 86400 },
  { label: '3 Days', seconds: 259200 },
  { label: '7 Days', seconds: 604800 },
  { label: '14 Days', seconds: 1209600 },
  { label: '21 Days', seconds: 1814400 },
  { label: '30 Days', seconds: 2592000 },
];

export function StakingPoolCardV2({ pool, walletAddress, isConnected, onRefresh }: StakingPoolCardV2Props) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [lockSeconds, setLockSeconds] = useState<string>('604800'); // Default 7 days
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const stakeTokenAddress = pool.stakeToken.toLowerCase();
  const rewardTokenAddress = pool.rewardToken.toLowerCase();
  
  const stakeDecimals = TOKEN_DECIMALS[stakeTokenAddress] || 18;
  const rewardDecimals = TOKEN_DECIMALS[rewardTokenAddress] || 18;

  const stakeSymbol = TOKEN_SYMBOLS[stakeTokenAddress] || 'TOKEN';
  const rewardSymbol = TOKEN_SYMBOLS[rewardTokenAddress] || 'TOKEN';

  // Hooks
  const { userInfo, refetch: refetchUser } = useUserPoolInfo(pool.pid, walletAddress);
  const { formatted: availableBalance, refetch: refetchBalance } = useFormattedBalance(
    pool.stakeToken as `0x${string}`,
    walletAddress,
    stakeDecimals
  );
  
  const { deposit, isPending: isDepositing, isSuccess: depositSuccess } = useDeposit();
  const { withdraw, isPending: isWithdrawing, isSuccess: withdrawSuccess } = useWithdraw();
  const { harvest, isPending: isHarvesting, isSuccess: harvestSuccess } = useHarvest();
  const { allowance, approve, isPending: isApproving, isSuccess: approveSuccess } = useTokenApproval(
    pool.stakeToken as `0x${string}`,
    walletAddress
  );

  // Prices for APR/TVL calc
  const stakePrice = useTokenPrice(pool.stakeToken);
  const rewardPrice = useTokenPrice(pool.rewardToken);

  const apr = calculateVirtualAPR(
    pool.rewardsPerSecond,
    rewardPrice,
    pool.totalStaked,
    stakePrice,
    rewardDecimals,
    stakeDecimals
  );

  const tvl = calculateVirtualTVL(pool.totalStaked, stakePrice, stakeDecimals);

  // Lock end check
  const now = Math.floor(Date.now() / 1000);
  const lockEnd = userInfo ? Number(userInfo.lockEnd) : 0;
  const isLocked = lockEnd > now;
  const timeUntilUnlock = isLocked ? lockEnd - now : 0;

  // Format lock countdown
  const formatLockTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Effects
  useEffect(() => {
    if (depositSuccess) {
      toast({ title: 'Deposit Successful', description: `Staked ${stakeAmount} ${stakeSymbol}` });
      setStakeAmount('');
      refetchUser();
      refetchBalance();
      onRefresh?.();
    }
  }, [depositSuccess]);

  useEffect(() => {
    if (withdrawSuccess) {
      toast({ title: 'Withdraw Successful', description: `Unstaked ${unstakeAmount} ${stakeSymbol}` });
      setUnstakeAmount('');
      refetchUser();
      refetchBalance();
      onRefresh?.();
    }
  }, [withdrawSuccess]);

  useEffect(() => {
    if (harvestSuccess) {
      toast({ title: 'Harvest Successful', description: 'Claimed your rewards' });
      refetchUser();
      onRefresh?.();
    }
  }, [harvestSuccess]);

  useEffect(() => {
    if (approveSuccess) {
      toast({ title: 'Approval Successful', description: `Approved ${stakeSymbol} spending` });
    }
  }, [approveSuccess]);

  // Handlers
  const handleStake = async () => {
    if (!stakeAmount || !lockSeconds) {
      toast({ title: 'Missing Input', description: 'Please enter amount and select lock period', variant: 'destructive' });
      return;
    }
    
    const amountWei = parseUnits(stakeAmount, stakeDecimals);
    
    if (allowance === undefined || allowance < amountWei) {
      await approve(stakeAmount, stakeDecimals);
    } else {
      await deposit(pool.pid, stakeAmount, parseInt(lockSeconds), stakeDecimals);
    }
  };

  const handleWithdrawClick = () => {
    if (isLocked) {
      toast({
        title: 'Stake Locked',
        description: `Cannot withdraw until lock expires (${formatLockTime(timeUntilUnlock)})`,
        variant: 'destructive',
      });
      return;
    }
    setShowWithdrawDialog(true);
  };

  const handleWithdrawConfirm = async () => {
    if (!unstakeAmount) {
      toast({ title: 'Missing Amount', description: 'Please enter amount to withdraw', variant: 'destructive' });
      return;
    }
    setShowWithdrawDialog(false);
    await withdraw(pool.pid, unstakeAmount, stakeDecimals);
  };

  const handleHarvest = async () => {
    if (isLocked) {
      toast({
        title: 'Stake Locked',
        description: `Cannot claim until lock expires (${formatLockTime(timeUntilUnlock)})`,
        variant: 'destructive',
      });
      return;
    }
    await harvest(pool.pid);
  };

  const userStaked = userInfo ? formatUnits(userInfo.amount, stakeDecimals) : '0';
  const pendingRewards = userInfo ? formatUnits(userInfo.pendingReward, rewardDecimals) : '0';

  const isActive = pool.rewardsPerSecond > 0n;

  return (
    <Card className="border-accent/20 bg-gradient-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base md:text-lg mb-2">
              Stake <span className="text-primary">{stakeSymbol}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Earn <span className="text-accent font-medium">{rewardSymbol}</span>
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
              {isActive ? 'Active' : 'Not Active'}
            </Badge>
            {pool.paused && (
              <Badge variant="destructive" className="text-xs">
                Paused
              </Badge>
            )}
            {isLocked && (
              <Badge variant="outline" className="text-xs border-orange-500 text-orange-600 dark:text-orange-400">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-background/40">
          <div>
            <p className="text-xs text-muted-foreground mb-1">APR</p>
            <p className="text-sm font-bold text-primary flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {apr > 0 ? `${apr.toFixed(2)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">TVL</p>
            <p className="text-sm font-bold">${compactNumber(tvl)}</p>
          </div>
        </div>

        {/* User Info */}
        {isConnected && walletAddress && (
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available:</span>
              <span className="font-medium">{formatBalance(availableBalance, 4)} {stakeSymbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Staked:</span>
              <span className="font-medium text-primary">{formatBalance(userStaked, 4)} {stakeSymbol}</span>
            </div>
            {isLocked && (
              <div className="flex justify-between items-center p-2 rounded bg-orange-500/10 border border-orange-500/30">
                <span className="text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Unlocks in:
                </span>
                <span className="font-bold text-orange-600 dark:text-orange-400">{formatLockTime(timeUntilUnlock)}</span>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!isConnected ? (
          <w3m-button />
        ) : (
          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="stake" disabled={pool.paused}>Stake</TabsTrigger>
              <TabsTrigger value="unstake">Unstake</TabsTrigger>
            </TabsList>

            <TabsContent value="stake" className="space-y-3">
              <Select value={lockSeconds} onValueChange={setLockSeconds}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lock period" />
                </SelectTrigger>
                <SelectContent>
                  {LOCK_OPTIONS.map(opt => (
                    <SelectItem key={opt.seconds} value={opt.seconds.toString()}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  disabled={pool.paused}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStakeAmount(availableBalance)}
                  disabled={pool.paused}
                >
                  MAX
                </Button>
              </div>
              <Button
                className="w-full"
                onClick={handleStake}
                disabled={isDepositing || isApproving || pool.paused || !stakeAmount}
              >
                {isDepositing || isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isApproving ? 'Approving...' : 'Staking...'}
                  </>
                ) : (
                  'Stake'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="unstake" className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUnstakeAmount(userStaked)}
                >
                  MAX
                </Button>
              </div>
              <Button
                className="w-full"
                variant="destructive"
                onClick={handleWithdrawClick}
                disabled={isWithdrawing || !unstakeAmount}
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Unstaking...
                  </>
                ) : (
                  'Unstake'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        )}

        {/* Pending Rewards */}
        {isConnected && walletAddress && Number(pendingRewards) > 0 && (
          <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">Pending Rewards</span>
              <span className="text-sm font-bold text-accent">{formatBalance(pendingRewards, 6)} {rewardSymbol}</span>
            </div>
            <Button
              size="sm"
              className="w-full"
              onClick={handleHarvest}
              disabled={isHarvesting || isLocked}
            >
              {isHarvesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Claiming...
                </>
              ) : (
                'Claim Rewards'
              )}
            </Button>
          </div>
        )}
      </CardContent>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unstake</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to unstake {unstakeAmount} {stakeSymbol}?
              This will also claim any pending rewards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleWithdrawConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
