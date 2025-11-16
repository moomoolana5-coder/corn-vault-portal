import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useIsOwner, useAllPools } from '@/hooks/useSimpleStaking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/addresses';
import simpleStakingAbi from '@/abi/SimpleStaking.json';
import { parseUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

export default function SimpleStakingAdmin() {
  const { isConnected } = useAccount();
  const { isOwner, isLoading: loadingOwner } = useIsOwner();
  const { pools, isLoading: loadingPools, refetch } = useAllPools();

  const [rewardRates, setRewardRates] = useState<{ [key: number]: string }>({});
  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleSetRewardRate = (poolId: number, decimals: number) => {
    const rate = rewardRates[poolId];
    if (!rate) return;

    try {
      const rateWei = parseUnits(rate, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: simpleStakingAbi,
        functionName: 'setRewardRate',
        args: [BigInt(poolId), rateWei],
      } as any);
      
      toast({
        title: 'Reward Rate Updated',
        description: `Pool ${poolId} reward rate set to ${rate} per second`,
      });
      
      refetch();
    } catch (err) {
      toast({
        title: 'Failed to Update',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = (poolId: number, currentActive: boolean) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: simpleStakingAbi,
        functionName: 'setPoolActive',
        args: [BigInt(poolId), !currentActive],
      } as any);
      
      toast({
        title: 'Pool Status Updated',
        description: `Pool ${poolId} is now ${!currentActive ? 'active' : 'inactive'}`,
      });
      
      refetch();
    } catch (err) {
      toast({
        title: 'Failed to Update',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Please connect your wallet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loadingOwner || loadingPools) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive font-semibold">Access Denied</p>
            <p className="text-muted-foreground mt-2">You do not have admin privileges</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Staking Admin</h1>
        <p className="text-muted-foreground">Manage staking pools and rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pools.map((pool) => (
          <Card key={pool.id}>
            <CardHeader>
              <CardTitle>Pool {pool.id}: {pool.stakeName} → {pool.rewardName}</CardTitle>
              <CardDescription>
                Stake {pool.stakeName} to earn {pool.rewardName} rewards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Staked</p>
                  <p className="font-semibold">
                    {(Number(pool.totalStaked) / 10 ** pool.stakeDecimals).toFixed(4)} {pool.stakeName}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Rate</p>
                  <p className="font-semibold">
                    {(Number(pool.rewardPerSecond) / 10 ** pool.rewardDecimals).toFixed(8)} /s
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reward Per Second</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={rewardRates[pool.id] || ''}
                    onChange={(e) =>
                      setRewardRates({ ...rewardRates, [pool.id]: e.target.value })
                    }
                    disabled={isPending || isConfirming}
                  />
                  <Button
                    onClick={() => handleSetRewardRate(pool.id, pool.rewardDecimals)}
                    disabled={!rewardRates[pool.id] || isPending || isConfirming}
                  >
                    {(isPending || isConfirming) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Set
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`active-${pool.id}`}>Pool Active</Label>
                <Switch
                  id={`active-${pool.id}`}
                  checked={pool.active}
                  onCheckedChange={() => handleToggleActive(pool.id, pool.active)}
                  disabled={isPending || isConfirming}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
