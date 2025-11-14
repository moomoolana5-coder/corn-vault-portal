import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbiV3 } from '@/abi/StakingContractV3';
import { parseUnits } from 'viem';
import { toast } from '@/hooks/use-toast';

// Pool info interface
export interface PoolInfoV3 {
  pid: number;
  stakeToken: string;
  rewardToken: string;
  totalStaked: bigint;
  rps: bigint;
  endTime: bigint;
  active: boolean;
  lastTime: bigint;
  accPerShare: bigint;
}

// User info interface
export interface UserInfoV3 {
  amount: bigint;
  debt: bigint;
  lockUntil: bigint;
  pendingReward: bigint;
}

// Lock period options
export const LOCK_OPTIONS = [
  { label: '1 Day', value: 0, seconds: 86400 },
  { label: '3 Days', value: 1, seconds: 259200 },
  { label: '7 Days', value: 2, seconds: 604800 },
  { label: '14 Days', value: 3, seconds: 1209600 },
  { label: '21 Days', value: 4, seconds: 1814400 },
  { label: '30 Days', value: 5, seconds: 2592000 },
];

// Hook to check if user is owner
export function useIsOwnerV3() {
  const { address } = useAccount();
  
  const { data: ownerAddress, isLoading } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV3,
    functionName: 'owner',
  });

  const isOwner = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  return {
    isOwner,
    isLoading,
    ownerAddress: ownerAddress as string | undefined,
  };
}

// Hook to get pool info
export function usePoolInfoV3(pid: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV3,
    functionName: 'poolInfo',
    args: [BigInt(pid)],
  });

  const pool: PoolInfoV3 | undefined = data ? {
    pid,
    stakeToken: (data as any)[0],
    rewardToken: (data as any)[1],
    totalStaked: (data as any)[2],
    rps: (data as any)[3],
    endTime: (data as any)[4],
    active: (data as any)[5],
    lastTime: (data as any)[6],
    accPerShare: (data as any)[7],
  } : undefined;

  return {
    pool,
    isLoading,
    error,
    refetch,
  };
}

// Hook to get all pools (2 pools: pid 0 and 1)
export function useAllPoolsV3() {
  const pool0 = usePoolInfoV3(0);
  const pool1 = usePoolInfoV3(1);

  const pools = [pool0.pool, pool1.pool].filter(Boolean) as PoolInfoV3[];
  const isLoading = pool0.isLoading || pool1.isLoading;

  const refetch = () => {
    pool0.refetch();
    pool1.refetch();
  };

  return {
    pools,
    isLoading,
    refetch,
  };
}

// Hook to get user info
export function useUserPoolInfoV3(pid: number, userAddress: `0x${string}` | undefined) {
  const { data: userInfoData, isLoading: userInfoLoading, refetch: refetchUserInfo } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV3,
    functionName: 'users',
    args: userAddress ? [BigInt(pid), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: pendingRewardData, isLoading: pendingLoading, refetch: refetchPending } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbiV3,
    functionName: 'pendingReward',
    args: userAddress ? [BigInt(pid), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000, // Poll every 10 seconds
    },
  });

  const userInfo: UserInfoV3 | undefined = userInfoData ? {
    amount: (userInfoData as any)[0],
    debt: (userInfoData as any)[1],
    lockUntil: (userInfoData as any)[2],
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
export function useDepositV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (pid: number, amount: string, lockOpt: number, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
        functionName: 'deposit',
        args: [BigInt(pid), amountWei, lockOpt],
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
export function useWithdrawV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (pid: number, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
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

// Claim hook
export function useClaimV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
        functionName: 'claim',
        args: [BigInt(pid)],
      } as any);
    } catch (err) {
      toast({
        title: 'Claim Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    claim,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Emergency Withdraw hook
export function useEmergencyWithdrawV3() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const emergencyWithdraw = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbiV3,
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
