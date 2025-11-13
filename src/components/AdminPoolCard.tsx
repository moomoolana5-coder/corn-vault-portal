import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Save, Clock } from 'lucide-react';
import { usePoolInfo } from '@/hooks/useStakingPools';
import { useSetEndTime, usePausePool, useUnpausePool } from '@/hooks/useStakingAdmin';
import { formatUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

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

  const { pool, isLoading: poolLoading, refetch: refetchPool } = usePoolInfo(pid);

  const { 
    setEndTime, 
    isPending: endTimeLoading, 
    isSuccess: endTimeSuccess,
    error: endTimeError 
  } = useSetEndTime();
  
  const { 
    pausePool, 
    isPending: pauseLoading, 
    isSuccess: pauseSuccess,
    error: pauseError 
  } = usePausePool();
  
  const { 
    unpausePool, 
    isPending: unpauseLoading, 
    isSuccess: unpauseSuccess,
    error: unpauseError 
  } = useUnpausePool();

  useEffect(() => {
    if (endTimeSuccess || pauseSuccess || unpauseSuccess) {
      refetchPool();
      onRefresh?.();

      if (endTimeSuccess) {
        toast({ title: 'Success', description: 'End time updated successfully' });
        setEndTimeDate('');
      }
      if (pauseSuccess) toast({ title: 'Success', description: 'Pool paused successfully' });
      if (unpauseSuccess) toast({ title: 'Success', description: 'Pool unpaused successfully' });
    }
  }, [endTimeSuccess, pauseSuccess, unpauseSuccess]);

  useEffect(() => {
    if (endTimeError) {
      toast({ 
        title: 'Set End Time Failed', 
        description: endTimeError.message || 'Transaction was rejected or failed',
        variant: 'destructive' 
      });
    }
    if (pauseError) {
      toast({ 
        title: 'Pause Pool Failed', 
        description: pauseError.message || 'Transaction was rejected or failed',
        variant: 'destructive' 
      });
    }
    if (unpauseError) {
      toast({ 
        title: 'Unpause Pool Failed', 
        description: unpauseError.message || 'Transaction was rejected or failed',
        variant: 'destructive' 
      });
    }
  }, [endTimeError, pauseError, unpauseError]);

  if (!pool || poolLoading) {
    return (
      <Card className="p-6 animate-pulse">
        <div className="h-48 bg-muted/20 rounded" />
      </Card>
    );
  }

  const stakeSymbol = TOKEN_SYMBOLS[pool.stakeToken.toLowerCase()] || pool.stakeToken.slice(0, 6);
  const rewardSymbol = TOKEN_SYMBOLS[pool.rewardToken.toLowerCase()] || pool.rewardToken.slice(0, 6);
  // RPS hidden in admin panel

  // RPS hidden in admin panel

  const handleSetEndTime = async () => {
    if (!endTimeDate) return;
    const timestamp = Math.floor(new Date(endTimeDate).getTime() / 1000);
    await setEndTime(pid, timestamp);
  };

  const handleTogglePause = async () => {
    if (pool.paused) {
      await unpausePool(pid);
    } else {
      await pausePool(pid);
    }
  };

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
          <Badge variant={pool.paused ? 'destructive' : 'default'}>
            {pool.paused ? 'Paused' : 'Active'}
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
          <p className="text-xs text-muted-foreground mb-1">End Time</p>
          <p className="text-sm font-semibold">
            {pool.endTime > 0n ? new Date(Number(pool.endTime) * 1000).toLocaleDateString() : 'Not Set'}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Stake Token</p>
          <p className="text-sm font-semibold">{stakeSymbol}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Reward Token</p>
          <p className="text-sm font-semibold">{rewardSymbol}</p>
        </div>
      </div>

      {/* Admin Controls */}
      <div className="space-y-4">
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
            variant={pool.paused ? 'default' : 'destructive'}
            className="w-full"
            onClick={handleTogglePause}
            disabled={pauseLoading || unpauseLoading}
          >
            {pool.paused ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                {unpauseLoading ? 'Unpausing...' : 'Unpause Pool'}
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 mr-2" />
                {pauseLoading ? 'Pausing...' : 'Pause Pool'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
