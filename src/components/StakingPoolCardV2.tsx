import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, Lock, Clock, AlertTriangle, Info } from 'lucide-react';
import { formatUnits, parseUnits } from 'viem';
import { formatBalance, compactNumber } from '@/lib/format';
import { toast } from '@/hooks/use-toast';
import { 
  useUserPoolInfoV3, 
  useDepositV3, 
  useWithdrawV3, 
  useClaimV3, 
  useEmergencyWithdrawV3,
  PoolInfoV3,
  LOCK_OPTIONS 
} from '@/hooks/useStakingV3';
import { useTokenApproval } from '@/hooks/useStakingActions';
import { useFormattedBalance } from '@/hooks/useErc20';
import { useTokenPrice, calculateVirtualAPR, calculateVirtualTVL } from '@/hooks/useTokenPrice';
import { ADDR } from '@/config/addresses';

interface StakingPoolCardV2Props {
  pool: PoolInfoV3;
  walletAddress: `0x${string}` | undefined;
  isConnected: boolean;
  onRefresh?: () => void;
}

const TOKEN_DECIMALS: Record<string, number> = {
  [ADDR.corn.toLowerCase()]: 18,
  [ADDR.xcorn.toLowerCase()]: 18,
  [ADDR.wpls.toLowerCase()]: 18,
  [ADDR.usdc.toLowerCase()]: 6,
};

const TOKEN_SYMBOLS: Record<string, string> = {
  [ADDR.corn.toLowerCase()]: 'CORN',
  [ADDR.xcorn.toLowerCase()]: 'xCORN',
  [ADDR.wpls.toLowerCase()]: 'WPLS',
  [ADDR.usdc.toLowerCase()]: 'USDC',
};

export function StakingPoolCardV2({ pool, walletAddress, isConnected, onRefresh }: StakingPoolCardV2Props) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [lockOptIndex, setLockOptIndex] = useState<string>('2'); // Default 7 days
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);

  const stakeTokenAddress = pool.stakeToken.toLowerCase();
  const rewardTokenAddress = pool.rewardToken.toLowerCase();
  
  const stakeDecimals = TOKEN_DECIMALS[stakeTokenAddress] || 18;
  const rewardDecimals = TOKEN_DECIMALS[rewardTokenAddress] || 6;

  const stakeSymbol = TOKEN_SYMBOLS[stakeTokenAddress] || 'TOKEN';
  const rewardSymbol = TOKEN_SYMBOLS[rewardTokenAddress] || 'USDC';

  // Hooks
  const { userInfo, refetch: refetchUser } = useUserPoolInfoV3(pool.pid, walletAddress);
  const { formatted: availableBalance, refetch: refetchBalance } = useFormattedBalance(
    pool.stakeToken as `0x${string}`,
    walletAddress,
    stakeDecimals
  );
  
  const { deposit, isPending: isDepositing, isSuccess: depositSuccess } = useDepositV3();
  const { withdraw, isPending: isWithdrawing, isSuccess: withdrawSuccess } = useWithdrawV3();
  const { claim, isPending: isClaiming, isSuccess: claimSuccess } = useClaimV3();
  const { emergencyWithdraw, isPending: isEmergencyWithdrawing, isSuccess: emergencySuccess } = useEmergencyWithdrawV3();
  const { allowance, approve, isPending: isApproving, isSuccess: approveSuccess } = useTokenApproval(
    pool.stakeToken as `0x${string}`,
    walletAddress
  );

  // Prices for APR/TVL calc
  const stakePrice = useTokenPrice(pool.stakeToken);
  const rewardPrice = useTokenPrice(pool.rewardToken);

  const apr = calculateVirtualAPR(
    pool.rps,
    rewardPrice,
    pool.totalStaked,
    stakePrice,
    rewardDecimals,
    stakeDecimals
  );

  const tvl = calculateVirtualTVL(pool.totalStaked, stakePrice, stakeDecimals);

  // Lock end check
  const now = Math.floor(Date.now() / 1000);
  const lockEnd = userInfo ? Number(userInfo.lockUntil) : 0;
  const isLocked = lockEnd > now;
  const lockEndDate = lockEnd > 0 ? new Date(lockEnd * 1000) : null;

  // Refetch on success
  useEffect(() => {
    if (depositSuccess || withdrawSuccess || claimSuccess || emergencySuccess || approveSuccess) {
      refetchUser();
      refetchBalance();
      onRefresh?.();
      setStakeAmount('');
      setUnstakeAmount('');
    }
  }, [depositSuccess, withdrawSuccess, claimSuccess, emergencySuccess, approveSuccess]);

  const handleStake = async () => {
    if (!stakeAmount || !walletAddress) return;
    
    try {
      const amountBigInt = parseUnits(stakeAmount, stakeDecimals);
      
      // Check allowance first
      if (allowance < amountBigInt) {
        toast({
          title: 'Approval Required',
          description: 'Please approve the staking contract to spend your tokens',
        });
        await approve(amountBigInt, ADDR.staking as `0x${string}`);
        return;
      }

      // Then deposit
      await deposit(pool.pid, stakeAmount, Number(lockOptIndex), stakeDecimals);
    } catch (error) {
      console.error('Stake error:', error);
      toast({
        title: 'Stake Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || !walletAddress) return;
    
    if (isLocked) {
      toast({
        title: 'Locked',
        description: 'You cannot unstake until the lock period ends',
        variant: 'destructive',
      });
      return;
    }

    try {
      await withdraw(pool.pid, unstakeAmount, stakeDecimals);
      setShowWithdrawDialog(false);
    } catch (error) {
      console.error('Unstake error:', error);
      toast({
        title: 'Unstake Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleClaim = async () => {
    if (!walletAddress) return;
    
    if (isLocked) {
      toast({
        title: 'Locked',
        description: 'You cannot claim rewards until the lock period ends',
        variant: 'destructive',
      });
      return;
    }

    try {
      await claim(pool.pid);
    } catch (error) {
      console.error('Claim error:', error);
      toast({
        title: 'Claim Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleEmergencyWithdraw = async () => {
    if (!walletAddress) return;
    
    try {
      await emergencyWithdraw(pool.pid);
    } catch (error) {
      console.error('Emergency withdraw error:', error);
      toast({
        title: 'Emergency Withdraw Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleMaxStake = () => {
    setStakeAmount(availableBalance || '0');
  };

  const handleMaxUnstake = () => {
    if (userInfo) {
      setUnstakeAmount(formatUnits(userInfo.amount, stakeDecimals));
    }
  };

  return (
    <Card className="border-border/40 bg-gradient-card backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <span className="bg-gradient-corn bg-clip-text text-transparent">
                Stake {stakeSymbol}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className="bg-gradient-corn bg-clip-text text-transparent">
                Earn {rewardSymbol}
              </span>
            </CardTitle>
          </div>
          <Badge variant={pool.active ? "default" : "destructive"}>
            {pool.active ? "Active" : "Not Active"}
          </Badge>
        </div>

        {!pool.active && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This pool is not active. Please wait for admin to activate it.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-background/60 p-3 rounded-lg border border-border/40">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <p className="text-xs text-muted-foreground">APR</p>
            </div>
            <p className="text-base md:text-lg font-bold text-primary">
              {apr !== null ? `${apr.toFixed(2)}%` : '—'}
            </p>
          </div>
          <div className="bg-background/60 p-3 rounded-lg border border-border/40">
            <p className="text-xs text-muted-foreground mb-1">TVL</p>
            <p className="text-base md:text-lg font-bold">
              ${tvl !== null ? compactNumber(tvl) : '—'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isConnected ? (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-background/40 rounded-lg border border-border/40">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Available</p>
                <p className="text-sm font-semibold truncate" title={availableBalance}>
                  {availableBalance ? formatBalance(availableBalance, 4) : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Staked</p>
                <p className="text-sm font-semibold">
                  {userInfo ? formatBalance(formatUnits(userInfo.amount, stakeDecimals), 4) : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Rewards</p>
                <p className="text-sm font-semibold text-primary">
                  {userInfo ? formatBalance(formatUnits(userInfo.pendingReward, rewardDecimals), 4) : '0'}
                </p>
              </div>
            </div>

            {/* Lock Status */}
            {isLocked && lockEndDate && (
              <Alert>
                <Lock className="h-4 w-4" />
                <AlertDescription>
                  <p className="text-sm font-semibold">Locked until {lockEndDate.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    You cannot unstake or claim rewards until the lock period ends
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Tabs */}
            <Tabs defaultValue="stake" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stake">Stake</TabsTrigger>
                <TabsTrigger value="unstake">Unstake</TabsTrigger>
              </TabsList>

              {/* Stake Tab */}
              <TabsContent value="stake" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Lock Period</label>
                  <Select value={lockOptIndex} onValueChange={setLockOptIndex}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select lock period" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCK_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          {opt.label}{opt.value === 2 ? ' (Recommended)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    <Info className="w-3 h-3 inline mr-1" />
                    You cannot unstake or claim rewards during the lock period
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount to Stake</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      disabled={!pool.active}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleMaxStake}
                      disabled={!pool.active}
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || isApproving || isDepositing || !pool.active}
                  className="w-full"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : isDepositing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Staking...
                    </>
                  ) : (
                    'Stake'
                  )}
                </Button>
              </TabsContent>

              {/* Unstake Tab */}
              <TabsContent value="unstake" className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Amount to Unstake</label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="0.0"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      disabled={isLocked}
                    />
                    <Button 
                      variant="outline" 
                      onClick={handleMaxUnstake}
                      disabled={isLocked}
                    >
                      MAX
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={() => setShowWithdrawDialog(true)}
                  disabled={!unstakeAmount || isWithdrawing || isLocked}
                  className="w-full"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Unstaking...
                    </>
                  ) : (
                    'Unstake'
                  )}
                </Button>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                onClick={handleClaim}
                disabled={!userInfo || userInfo.pendingReward === 0n || isClaiming || isLocked}
                variant="outline"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  `Claim ${rewardSymbol}`
                )}
              </Button>

              <Button
                onClick={handleEmergencyWithdraw}
                disabled={!userInfo || userInfo.amount === 0n || isEmergencyWithdrawing}
                variant="destructive"
              >
                {isEmergencyWithdrawing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  'Emergency Withdraw'
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Emergency withdraw forfeits all pending rewards
            </p>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Connect your wallet to stake</p>
          </div>
        )}
      </CardContent>

      {/* Withdraw Confirmation Dialog */}
      <AlertDialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Unstake</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to unstake {unstakeAmount} {stakeSymbol}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnstake}>
              Confirm Unstake
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
