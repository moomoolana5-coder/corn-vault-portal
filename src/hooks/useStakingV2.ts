import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbiV2 } from '@/abi/StakingContractV2';
import { parseUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

// Pool info interface
export interface PoolInfoV2 {
  pid: number;
  stakeToken: string;
  rewardToken: string;
  accRewardPerShare: bigint;
  lastTime: bigint;
  rewardsPerSecond: bigint;
  endTime: bigint;
  totalStaked: bigint;
  paused: boolean;
}

// User info interface
export interface UserInfoV2 {
  amount: bigint;
  rewardDebt: bigint;
  lockEnd: bigint;
  pendingReward: bigint;
}

// Hook to check if user is owner
export function useIsOwner() {
  const { address } = useAccount();
  
  const { data: ownerAddress, isLoading } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV2,
    functionName: 'owner',
  });

  const isOwner = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  return {
    isOwner,
    isLoading,
    ownerAddress: ownerAddress as string | undefined,
  };
}

// Hook to check emergency mode
export function useEmergencyMode() {
  const { data, isLoading, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV2,
    functionName: 'emergencyMode',
  });

  return {
    emergencyMode: data as boolean | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get pool length
export function usePoolLength() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV2,
    functionName: 'poolLength',
  });

  return {
    poolLength: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

// Hook to get pool info
export function usePoolInfo(pid: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV2,
    functionName: 'pools',
    args: [BigInt(pid)],
  });

  const pool: PoolInfoV2 | undefined = data ? {
    pid,
    stakeToken: (data as any)[0],
    rewardToken: (data as any)[1],
    accRewardPerShare: (data as any)[2],
    lastTime: (data as any)[3],
    rewardsPerSecond: (data as any)[4],
    endTime: (data as any)[5],
    totalStaked: (data as any)[6],
    paused: (data as any)[7],
  } : undefined;

  return {
    pool,
    isLoading,
    error,
    refetch,
  };
}

// Hook to get all pools
export function useAllPools() {
  const { poolLength, isLoading: lengthLoading } = usePoolLength();
  
  // For fixed 5 pools, we can hardcode
  const pool0 = usePoolInfo(0);
  const pool1 = usePoolInfo(1);
  const pool2 = usePoolInfo(2);
  const pool3 = usePoolInfo(3);
  const pool4 = usePoolInfo(4);

  const pools = [pool0.pool, pool1.pool, pool2.pool, pool3.pool, pool4.pool].filter(Boolean) as PoolInfoV2[];
  const isLoading = lengthLoading || pool0.isLoading || pool1.isLoading || pool2.isLoading || pool3.isLoading || pool4.isLoading;

  const refetch = () => {
    pool0.refetch();
    pool1.refetch();
    pool2.refetch();
    pool3.refetch();
    pool4.refetch();
  };

  return {
    pools,
    isLoading,
    refetch,
  };
}

// Hook to get user info
export function useUserPoolInfo(pid: number, userAddress: `0x${string}` | undefined) {
  const { data: userInfoData, isLoading: userInfoLoading, refetch: refetchUserInfo } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV2,
    functionName: 'userInfo',
    args: userAddress ? [BigInt(pid), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: pendingRewardData, isLoading: pendingLoading, refetch: refetchPending } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV2,
    functionName: 'pendingReward',
    args: userAddress ? [BigInt(pid), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000, // Poll every 10 seconds
    },
  });

  const userInfo: UserInfoV2 | undefined = userInfoData ? {
    amount: (userInfoData as any)[0],
    rewardDebt: (userInfoData as any)[1],
    lockEnd: (userInfoData as any)[2],
    pendingReward: pendingRewardData as bigint || 0n,
  } : undefined;

  const refetch = () => {
    refetchUserInfo();
    refetchPending();
  };

  return {
    userInfo,
    isLoading: userInfoLoading || pendingLoading,
    refetch,
  };
}

// Deposit hook
export function useDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (pid: number, amount: string, lockSec: number, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'deposit',
        args: [BigInt(pid), amountWei, BigInt(lockSec)],
      } as any);
    } catch (err) {
      toast({
        title: 'Deposit Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    deposit,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Withdraw hook
export function useWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (pid: number, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'withdraw',
        args: [BigInt(pid), amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Withdraw Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    withdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Harvest hook
export function useHarvest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const harvest = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'harvest',
        args: [BigInt(pid)],
      } as any);
    } catch (err) {
      toast({
        title: 'Harvest Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    harvest,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Claim All hook
export function useClaimAll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimAll = async (pids: number[]) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'claimAll',
        args: [pids.map(p => BigInt(p))],
      } as any);
    } catch (err) {
      toast({
        title: 'Claim All Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    claimAll,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Emergency Withdraw hook
export function useEmergencyWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const emergencyWithdraw = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV2,
        functionName: 'emergencyWithdraw',
        args: [BigInt(pid)],
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
    emergencyWithdraw,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}
