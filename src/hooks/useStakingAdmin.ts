import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbi } from '@/abi/StakingContract';
import { parseUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

export function useIsOwner() {
  const { address } = useAccount();
  
  const { data: ownerAddress, isLoading } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbi,
    functionName: 'owner',
  });

  const isOwner = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  return {
    isOwner,
    isLoading,
    ownerAddress: ownerAddress as string | undefined,
  };
}

export function useSetRewardsPerSecond() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setRewardsPerSecond = async (pid: number, rps: string, decimals: number) => {
    try {
      const rpsWei = parseUnits(rps, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'setRewardsPerSecond',
        args: [BigInt(pid), rpsWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Set RPS Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    setRewardsPerSecond,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

export function useSetEndTime() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setEndTime = async (pid: number, endTime: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'setEndTime',
        args: [BigInt(pid), BigInt(endTime)],
      } as any);
    } catch (err) {
      toast({
        title: 'Set End Time Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    setEndTime,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

export function usePausePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pausePool = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'pausePool',
        args: [BigInt(pid)],
      } as any);
    } catch (err) {
      toast({
        title: 'Pause Pool Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    pausePool,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}

export function useUnpausePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unpausePool = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'unpausePool',
        args: [BigInt(pid)],
      } as any);
    } catch (err) {
      toast({
        title: 'Unpause Pool Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    unpausePool,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
  };
}
