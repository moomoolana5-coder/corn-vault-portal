import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Save, Clock, Zap } from 'lucide-react';
import { usePoolInfo } from '@/hooks/useStakingPools';
import { useSetEndTime, useSetRewardsPerSecond } from '@/hooks/useStakingAdmin';
import { usePoolPauseStatus, useTogglePoolPause } from '@/hooks/usePoolPauseStatus';
import { useTokenMeta } from '@/hooks/useErc20';
import { formatUnits } from 'viem';
import { toast } from '@/hooks/use-toast';
import { useAccount } from 'wagmi';

interface AdminPoolCardProps {
  pid: number;
  onRefresh?: () => void;
}

const TOKEN_SYMBOLS: Record<string, string> = {
  '0xd7661cce8eed01cbaa0188facdde2e46c4ebe4b0': 'CORN',
  '0xa1077a294dde1b09bb078844df40758a5d0f9a27': 'WPLS',
  '0x15d38573d2feeb82e7ad5187ab8c1d52810b1f07': 'USDC',
  '0x3facf37bc7d46fe899a3fe4991c3ee8a8e7ab489': 'veCORN',
};

export function AdminPoolCard({ pid, onRefresh }: AdminPoolCardProps) {
  const [endTimeDate, setEndTimeDate] = useState('');
  const [rpsValue, setRpsValue] = useState('');
  const { address } = useAccount();

  const { pool, isLoading: poolLoading, refetch: refetchPool } = usePoolInfo(pid);
  const { data: pauseStatus, isLoading: pauseStatusLoading } = usePoolPauseStatus(pid);
  const togglePause = useTogglePoolPause();
  const rewardTokenMeta = useTokenMeta(pool?.rewardToken ?? '0x0');

  const { 
    setEndTime, 
    isPending: endTimeLoading, 
    isSuccess: endTimeSuccess,
    error: endTimeError 
  } = useSetEndTime();

  const {
    setRewardsPerSecond,
    isPending: rpsLoading,
    isSuccess: rpsSuccess,
    error: rpsError
  } = useSetRewardsPerSecond();

  useEffect(() => {
    if (endTimeSuccess) {
      refetchPool();
      onRefresh?.();
      toast({ title: 'Success', description: 'End time updated successfully' });
      setEndTimeDate('');
    }
  }, [endTimeSuccess]);

  useEffect(() => {
    if (rpsSuccess) {
      refetchPool();
      onRefresh?.();
      toast({ title: 'Success', description: 'Rewards per second updated successfully' });
      setRpsValue('');
    }
  }, [rpsSuccess]);

  useEffect(() => {
    if (endTimeError) {
      toast({ 
        title: 'Set End Time Failed', 
        description: endTimeError.message || 'Transaction was rejected or failed',
        variant: 'destructive' 
      });
    }
  }, [endTimeError]);

  useEffect(() => {
    if (rpsError) {
      toast({ 
        title: 'Set Rewards Failed', 
        description: rpsError.message || 'Transaction was rejected or failed',
        variant: 'destructive' 
      });
    }
  }, [rpsError]);

  if (!pool || poolLoading || pauseStatusLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-48 bg-muted/20 rounded" />
      </Card>
    );
  }

  const stakeSymbol = TOKEN_SYMBOLS[pool.stakeToken.toLowerCase()] || pool.stakeToken.slice(0, 6);
  const rewardSymbol = TOKEN_SYMBOLS[pool.rewardToken.toLowerCase()] || pool.rewardToken.slice(0, 6);
  const currentRPS = pool.rewardsPerSecond > 0n 
    ? formatUnits(pool.rewardsPerSecond, rewardTokenMeta.decimals || 18)
    : '0';

  const handleSetEndTime = async () => {
    if (!endTimeDate) return;
    const timestamp = Math.floor(new Date(endTimeDate).getTime() / 1000);
    await setEndTime(pid, timestamp);
  };

  const handleSetRPS = async () => {
    if (!rpsValue || !rewardTokenMeta.decimals) return;
    await setRewardsPerSecond(pid, rpsValue, rewardTokenMeta.decimals);
  };

  const handleTogglePause = async () => {
    if (!address) return;
    
    const newPauseState = !pauseStatus?.is_paused;
    await togglePause.mutateAsync({
      poolId: pid,
      isPaused: newPauseState,
      pausedBy: address,
    });
  };

  const isPaused = pauseStatus?.is_paused || false;

  const isPoolActive = !isPaused && pool.rewardsPerSecond > 0n;

  return (
    <Card className="border-border/40 bg-gradient-card backdrop-blur-sm p-6">
      {/* Pool Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold">Pool #{pid}</h3>
          <p className="text-sm text-muted-foreground">
            {pool.label || `${stakeSymbol} → ${rewardSymbol}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={isPaused ? 'outline' : 'default'} className={isPaused ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400' : ''}>
            {isPaused ? 'Not Active' : 'Active'}
          </Badge>
          {pool.rewardsPerSecond === 0n && (
            <Badge variant="outline" className="bg-yellow-500/10 border-yellow-500/30">
              Not Configured
            </Badge>
          )}
        </div>
      </div>

      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-lg bg-background/60">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Total Staked</p>
          <p className="text-sm font-semibold">
            {formatUnits(pool.totalStaked, 18)} {stakeSymbol}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current RPS</p>
          <p className="text-sm font-semibold">
            {currentRPS} {rewardSymbol}/s
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">End Time</p>
          <p className="text-sm font-semibold">
            {pool.endTime > 0n ? new Date(Number(pool.endTime) * 1000).toLocaleDateString() : 'Not Set'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Stake Token</p>
          <p className="text-sm font-semibold">{stakeSymbol}</p>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="space-y-4">
        {/* Set Rewards Per Second */}
        <div className="space-y-2">
          <Label htmlFor={`rps-${pid}`} className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Set Rewards Per Second
          </Label>
          <div className="flex gap-2">
            <Input
              id={`rps-${pid}`}
              type="number"
              step="any"
              placeholder={`e.g., 0.1 ${rewardSymbol}`}
              value={rpsValue}
              onChange={(e) => setRpsValue(e.target.value)}
            />
            <Button
              onClick={handleSetRPS}
              disabled={!rpsValue || rpsLoading || !rewardTokenMeta.decimals}
              className="flex-shrink-0"
            >
              <Save className="w-4 h-4 mr-2" />
              {rpsLoading ? 'Setting...' : 'Set'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Current: {currentRPS} {rewardSymbol}/s
          </p>
        </div>

        {/* Set End Time */}
        <div className="space-y-2">
          <Label htmlFor={`endtime-${pid}`} className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Set End Time
          </Label>
          <div className="flex gap-2">
            <Input
              id={`endtime-${pid}`}
              type="datetime-local"
              value={endTimeDate}
              onChange={(e) => setEndTimeDate(e.target.value)}
            />
            <Button
              onClick={handleSetEndTime}
              disabled={!endTimeDate || endTimeLoading}
              className="flex-shrink-0"
            >
              <Save className="w-4 h-4 mr-2" />
              {endTimeLoading ? 'Setting...' : 'Set'}
            </Button>
          </div>
        </div>

        {/* Pause/Unpause */}
        <div className="pt-4 border-t border-border/40">
          <Button
            variant={isPaused ? 'default' : 'outline'}
            className="w-full"
            onClick={handleTogglePause}
            disabled={togglePause.isPending}
          >
            {isPaused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                {togglePause.isPending ? 'Activating...' : 'Activate Pool'}
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                {togglePause.isPending ? 'Deactivating...' : 'Deactivate Pool'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
