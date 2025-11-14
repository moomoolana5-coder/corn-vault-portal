import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbiV3 } from '@/abi/StakingContractV3';
import { parseUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

// Set Rewards Per Second
export function useSetRewardsPerSecondV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setRewardsPerSecond = async (pid: number, rps: string) => {
    try {
      const rpsWei = parseUnits(rps, 6); // USDC has 6 decimals
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
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
    hash,
  };
}

// Set End Time
export function useSetEndTimeV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setEndTime = async (pid: number, endTime: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
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
    hash,
  };
}

// Set Active (Activate/Deactivate Pool)
export function useSetActiveV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setActive = async (pid: number, active: boolean) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
        functionName: 'setActive',
        args: [BigInt(pid), active],
      } as any);
    } catch (err) {
      toast({
        title: 'Set Active Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    setActive,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Sweep
export function useSweepV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sweep = async (token: string, to: string, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
        functionName: 'sweep',
        args: [token as `0x${string}`, to as `0x${string}`, amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Sweep Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    sweep,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Transfer Ownership
export function useTransferOwnershipV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const transferOwnership = async (newOwner: string) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
        functionName: 'transferOwnership',
        args: [newOwner as `0x${string}`],
      } as any);
    } catch (err) {
      toast({
        title: 'Transfer Ownership Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    transferOwnership,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
