import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbiV2 } from '@/abi/StakingContractV2';
import { parseUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

// Set Rewards Per Second
export function useSetRewardsPerSecond() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setRewardsPerSecond = async (pid: number, rps: string, decimals: number) => {
    try {
      const rpsWei = parseUnits(rps, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
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

// Fund Epoch
export function useFundEpoch() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const fundEpoch = async (pid: number, amount: string, duration: number, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'fundEpoch',
        args: [BigInt(pid), amountWei, BigInt(duration)],
      } as any);
    } catch (err) {
      toast({
        title: 'Fund Epoch Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    fundEpoch,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Pause Pool
export function usePausePool() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const pausePool = async (pid: number, pause: boolean) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'pausePool',
        args: [BigInt(pid), pause],
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
    hash,
  };
}

// Set Emergency Mode
export function useSetEmergencyMode() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const setEmergencyMode = async (enabled: boolean) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'setEmergencyMode',
        args: [enabled],
      } as any);
    } catch (err) {
      toast({
        title: 'Set Emergency Mode Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    setEmergencyMode,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Admin Force Withdraw
export function useAdminForceWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adminForceWithdraw = async (pid: number, user: string, to: string) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'adminForceWithdraw',
        args: [BigInt(pid), user as `0x${string}`, to as `0x${string}`],
      } as any);
    } catch (err) {
      toast({
        title: 'Force Withdraw Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    adminForceWithdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Admin Withdraw Surplus
export function useAdminWithdrawSurplus() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adminWithdrawSurplus = async (token: string, to: string, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'adminWithdrawSurplus',
        args: [token as `0x${string}`, to as `0x${string}`, amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Withdraw Surplus Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    adminWithdrawSurplus,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Admin Withdraw Emergency
export function useAdminWithdrawEmergency() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adminWithdrawEmergency = async (token: string, to: string, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'adminWithdrawEmergency',
        args: [token as `0x${string}`, to as `0x${string}`, amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Emergency Withdraw Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    adminWithdrawEmergency,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Admin Drain Pool Stake Token
export function useAdminDrainPoolStakeToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const adminDrainPoolStakeToken = async (pid: number, to: string, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'adminDrainPoolStakeToken',
        args: [BigInt(pid), to as `0x${string}`, amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Drain Pool Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    adminDrainPoolStakeToken,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Sweep
export function useSweep() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const sweep = async (token: string, to: string, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
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
export function useTransferOwnership() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const transferOwnership = async (newOwner: string) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
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
