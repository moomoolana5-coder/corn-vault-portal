import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { usePoolInfo, useUserPoolInfo } from '@/hooks/useStakingPools';
import { useStakingDeposit, useStakingWithdraw, useStakingHarvest, useTokenApproval } from '@/hooks/useStakingActions';
import { useFormattedBalance, useTokenMeta } from '@/hooks/useErc20';
import { useTokenPrice, calculateVirtualAPR, calculateVirtualTVL } from '@/hooks/useTokenPrice';
import { formatUnits, parseUnits } from 'viem';
import { formatBalance, compactNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import usdcLogo from '@/assets/usdc-logo.png';
import cornLogo from '@/assets/corn-logo-new.png';
import wplsLogo from '@/assets/wpls-logo.jpg';

interface StakingPoolCardProps {
  pid: number;
  walletAddress: `0x${string}` | undefined;
  isConnected: boolean;
  onRefresh?: () => void;
}

const TOKEN_SYMBOLS: Record<string, string> = {
  '0xd7661cce8eed01cbaa0188facdde2e46c4ebe4b0': 'CORN',
  '0xa1077a294dde1b09bb078844df40758a5d0f9a27': 'WPLS',
  '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07': 'USDC',
  '0x3facf37bc7d46fe899a3fe4991c3ee8a8e7ab489': 'veCORN',
};

const TOKEN_ICONS: Record<string, string> = {
  CORN: '🌽',
  WPLS: '⚡',
  USDC: '⭕',
  veCORN: '🟡',
};

export function StakingPoolCard({ pid, walletAddress, isConnected, onRefresh }: StakingPoolCardProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [showVirtualAPR, setShowVirtualAPR] = useState(true);

  const { pool, isLoading: poolLoading, refetch: refetchPool } = usePoolInfo(pid);
  const { userInfo, refetch: refetchUser } = useUserPoolInfo(pid, walletAddress);
  
  const stakeTokenMeta = useTokenMeta(pool?.stakeToken ?? '0x0');
  const rewardTokenMeta = useTokenMeta(pool?.rewardToken ?? '0x0');
  
  const stakeBalance = useFormattedBalance(
    pool?.stakeToken ?? '0x0',
    walletAddress,
    stakeTokenMeta.decimals
  );

  const stakeTokenPrice = useTokenPrice(pool?.stakeToken ?? '0x0');
  const rewardTokenPrice = useTokenPrice(pool?.rewardToken ?? '0x0');

  const { deposit, isPending: depositPending, isSuccess: depositSuccess } = useStakingDeposit();
  const { withdraw, isPending: withdrawPending, isSuccess: withdrawSuccess } = useStakingWithdraw();
  const { harvest, isPending: harvestPending, isSuccess: harvestSuccess } = useStakingHarvest();
  const { allowance, approve, isPending: approvePending, isSuccess: approveSuccess, refetch: refetchAllowance } = useTokenApproval(
    pool?.stakeToken ?? '0x0',
    walletAddress
  );

  useEffect(() => {
    if (depositSuccess || withdrawSuccess || harvestSuccess || approveSuccess) {
      refetchPool();
      refetchUser();
      stakeBalance.refetch();
      
      // Refetch allowance after approve success
      if (approveSuccess) {
        setTimeout(() => {
          refetchAllowance();
        }, 1000);
      }
      
      onRefresh?.();
      setStakeAmount('');
      setUnstakeAmount('');
      
      if (depositSuccess) toast({ title: 'Deposit Successful', description: 'Your tokens have been staked.' });
      if (withdrawSuccess) toast({ title: 'Withdraw Successful', description: 'Your tokens have been withdrawn.' });
      if (harvestSuccess) toast({ title: 'Harvest Successful', description: 'Your rewards have been claimed.' });
      if (approveSuccess) {
        toast({ title: 'Approval Successful', description: 'You can now stake your tokens.' });
      }
    }
  }, [depositSuccess, withdrawSuccess, harvestSuccess, approveSuccess]);

  if (!pool || poolLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-64 bg-muted/20 rounded" />
      </Card>
    );
  }

  const stakeSymbol = TOKEN_SYMBOLS[pool.stakeToken.toLowerCase()] || 'TOKEN';
  const rewardSymbol = TOKEN_SYMBOLS[pool.rewardToken.toLowerCase()] || 'TOKEN';
  const isVirtualReward = rewardSymbol === 'WPLS' || rewardSymbol === 'USDC';

  const stakedFormatted = formatUnits(userInfo.amount, stakeTokenMeta.decimals || 18);
  const pendingFormatted = formatUnits(userInfo.pending, rewardTokenMeta.decimals || 18);
  const rpsFormatted = formatUnits(pool.rewardsPerSecond, rewardTokenMeta.decimals || 18);

  const virtualAPR = showVirtualAPR && stakeTokenMeta.decimals && rewardTokenMeta.decimals
    ? calculateVirtualAPR(
        pool.rewardsPerSecond,
        rewardTokenPrice,
        pool.totalStaked,
        stakeTokenPrice,
        rewardTokenMeta.decimals,
        stakeTokenMeta.decimals
      )
    : 0;

  const virtualTVL = stakeTokenMeta.decimals
    ? calculateVirtualTVL(pool.totalStaked, stakeTokenPrice, stakeTokenMeta.decimals)
    : 0;

  const getTokenLogo = (symbol: string) => {
    if (symbol === 'USDC') return usdcLogo;
    if (symbol === 'CORN') return cornLogo;
    if (symbol === 'WPLS') return wplsLogo;
    return null;
  };

  const handleDeposit = async () => {
    if (!stakeAmount || !stakeTokenMeta.decimals) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid stake amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Validate amount
      const amountBigInt = parseUnits(stakeAmount, stakeTokenMeta.decimals);
      
      if (amountBigInt <= 0n) {
        toast({
          title: 'Invalid Amount',
          description: 'Amount must be greater than 0',
          variant: 'destructive',
        });
        return;
      }

      // Check balance
      if (stakeBalance.balance && amountBigInt > stakeBalance.balance) {
        toast({
          title: 'Insufficient Balance',
          description: `You only have ${formatBalance(stakeBalance.formatted)} ${stakeSymbol}`,
          variant: 'destructive',
        });
        return;
      }

      // Check allowance
      if (!allowance || allowance < amountBigInt) {
        toast({
          title: 'Approval Required',
          description: 'Please approve tokens first',
          variant: 'destructive',
        });
        return;
      }

      await deposit(pid, stakeAmount, stakeTokenMeta.decimals);
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: 'Deposit Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleWithdraw = async () => {
    if (!unstakeAmount || !stakeTokenMeta.decimals) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid unstake amount',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Validate amount
      const amountBigInt = parseUnits(unstakeAmount, stakeTokenMeta.decimals);
      
      if (amountBigInt <= 0n) {
        toast({
          title: 'Invalid Amount',
          description: 'Amount must be greater than 0',
          variant: 'destructive',
        });
        return;
      }

      // Check staked balance
      if (amountBigInt > userInfo.amount) {
        toast({
          title: 'Insufficient Staked Balance',
          description: `You only have ${formatBalance(stakedFormatted)} ${stakeSymbol} staked`,
          variant: 'destructive',
        });
        return;
      }

      await withdraw(pid, unstakeAmount, stakeTokenMeta.decimals);
    } catch (error) {
      console.error('Withdraw error:', error);
      toast({
        title: 'Withdraw Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleHarvest = async () => {
    await harvest(pid);
  };

  const handleApprove = async () => {
    if (!stakeAmount || !stakeTokenMeta.decimals) return;
    // Approve max uint256 for unlimited allowance (common practice)
    await approve('max', stakeTokenMeta.decimals);
  };

  return (
    <Card className="group relative overflow-hidden border-border/40 bg-gradient-card backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative p-6">
        {/* Pool Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {getTokenLogo(stakeSymbol) ? (
                <img src={getTokenLogo(stakeSymbol)!} alt={stakeSymbol} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                  {TOKEN_ICONS[stakeSymbol]}
                </div>
              )}
              <span className="text-lg font-bold">→</span>
              {getTokenLogo(rewardSymbol) ? (
                <img src={getTokenLogo(rewardSymbol)!} alt={rewardSymbol} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-xl">
                  {TOKEN_ICONS[rewardSymbol]}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold">{pool.label || `Stake ${stakeSymbol}`}</p>
              <p className="text-xs text-muted-foreground">Earn {rewardSymbol}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            {pool.paused && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Paused
              </Badge>
            )}
            {pool.rewardsPerSecond === 0n && !pool.paused && (
              <Badge variant="outline" className="text-xs bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400">
                <Clock className="w-3 h-3 mr-1" />
                Not Active
              </Badge>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-lg bg-background/60 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">APR</p>
            <p className="text-sm font-bold text-primary">
              {virtualAPR > 0 ? `${virtualAPR.toFixed(2)}%` : '0.00%'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-background/60 border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">TVL</p>
            <p className="text-sm font-bold">${virtualTVL > 0 ? compactNumber(virtualTVL) : '0.00'}</p>
          </div>
        </div>

        {/* Balance Display */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-lg bg-background/60 border border-border/40">
            <p className="text-xs font-medium text-muted-foreground mb-1">Available</p>
            <p className="text-base font-semibold">{isConnected ? formatBalance(stakeBalance.formatted) : '—'}</p>
            <p className="text-xs text-muted-foreground">{stakeSymbol}</p>
          </div>
          <div className="p-4 rounded-lg bg-background/60 border border-border/40">
            <p className="text-xs font-medium text-muted-foreground mb-1">Staked</p>
            <p className="text-base font-semibold">{isConnected ? formatBalance(stakedFormatted) : '—'}</p>
            <p className="text-xs text-muted-foreground">{stakeSymbol}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="stake">Stake</TabsTrigger>
            <TabsTrigger value="unstake">Unstake</TabsTrigger>
          </TabsList>

          <TabsContent value="stake" className="space-y-4 mt-4">
            {!isConnected ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Connect wallet to stake</p>
                <w3m-button />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor={`stake-${pid}`}>Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`stake-${pid}`}
                      type="number"
                      step="any"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={pool.paused}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStakeAmount(stakeBalance.formatted)}
                      disabled={pool.paused}
                    >
                      MAX
                    </Button>
                  </div>
                  {stakeBalance.formatted && parseFloat(stakeBalance.formatted) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Available: {formatBalance(stakeBalance.formatted)} {stakeSymbol}
                    </p>
                  )}
                </div>
                {/* Check if approval is needed */}
                {(() => {
                  if (!stakeAmount || !stakeTokenMeta.decimals) {
                    return (
                      <Button
                        className="w-full"
                        disabled
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Enter Amount
                      </Button>
                    );
                  }

                  // Parse input amount
                  const inputAmount = parseUnits(stakeAmount, stakeTokenMeta.decimals);
                  const needsApproval = !allowance || allowance < inputAmount;

                  if (needsApproval) {
                    return (
                      <>
                        {allowance !== undefined && allowance > 0n && (
                          <p className="text-xs text-muted-foreground">
                            Current allowance: {formatUnits(allowance, stakeTokenMeta.decimals)} {stakeSymbol}
                          </p>
                        )}
                        <Button
                          className="w-full"
                          onClick={handleApprove}
                          disabled={approvePending || pool.paused}
                        >
                          <Lock className="w-4 h-4 mr-2" />
                          {approvePending ? 'Approving...' : `Approve ${stakeSymbol}`}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                          Approval needed before staking
                        </p>
                      </>
                    );
                  }

                  return (
                    <Button
                      className="w-full"
                      onClick={handleDeposit}
                      disabled={
                        depositPending || 
                        pool.paused || 
                        !stakeBalance.balance || 
                        (stakeBalance.balance && inputAmount > stakeBalance.balance)
                      }
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {depositPending ? 'Staking...' : `Stake ${stakeSymbol}`}
                    </Button>
                  );
                })()}
              </>
            )}
          </TabsContent>

          <TabsContent value="unstake" className="space-y-4 mt-4">
            {!isConnected ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">Connect wallet to unstake</p>
                <w3m-button />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor={`unstake-${pid}`}>Amount</Label>
                  <div className="flex gap-2">
                    <Input
                      id={`unstake-${pid}`}
                      type="number"
                      placeholder="0.0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnstakeAmount(stakedFormatted)}
                    >
                      MAX
                    </Button>
                  </div>
                </div>
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={handleWithdraw}
                  disabled={!unstakeAmount || withdrawPending || userInfo.amount === 0n}
                >
                  <Unlock className="w-4 h-4 mr-2" />
                  {withdrawPending ? 'Unstaking...' : `Unstake ${stakeSymbol}`}
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Pending Rewards */}
        <div className="mt-6 pt-6 border-t border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Pending Rewards</p>
              <p className="text-base font-semibold">
                {isConnected ? formatBalance(pendingFormatted, 6) : '—'}{' '}
                <span className="text-xs font-normal text-muted-foreground">{rewardSymbol}</span>
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleHarvest}
              disabled={!isConnected || harvestPending || userInfo.pending === 0n || pool.paused}
            >
              {harvestPending ? 'Claiming...' : 'Claim'}
            </Button>
          </div>
        </div>

        {/* End Time */}
        {pool.endTime > 0n && (
          <div className="mt-4 p-3 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Epoch ends: {new Date(Number(pool.endTime) * 1000).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
