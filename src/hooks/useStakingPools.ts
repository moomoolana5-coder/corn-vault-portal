import { useReadContract, useReadContracts } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbi } from '@/abi/StakingContract';
import { formatUnits } from 'viem';

export interface PoolInfo {
  pid: number;
  stakeToken: `0x${string}`;
  rewardToken: `0x${string}`;
  accRewardPerShare: bigint;
  lastTime: bigint;
  rewardsPerSecond: bigint;
  endTime: bigint;
  totalStaked: bigint;
  paused: boolean;
  label: string;
}

export interface UserPoolInfo {
  amount: bigint;
  rewardDebt: bigint;
  pending: bigint;
}

export function usePoolLength() {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbi,
    functionName: 'poolLength',
  });

  return {
    poolLength: data ? Number(data) : 0,
    isLoading,
    error,
    refetch,
  };
}

export function usePoolInfo(pid: number) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbi,
    functionName: 'pools',
    args: [BigInt(pid)],
  });

  if (!data) {
    return { pool: null, isLoading, error, refetch };
  }

  const pool: PoolInfo = {
    pid,
    stakeToken: data[0] as `0x${string}`,
    rewardToken: data[1] as `0x${string}`,
    accRewardPerShare: data[2] as bigint,
    lastTime: data[3] as bigint,
    rewardsPerSecond: data[4] as bigint,
    endTime: data[5] as bigint,
    totalStaked: data[6] as bigint,
    paused: data[7] as boolean,
    label: data[8] as string,
  };

  return { pool, isLoading, error, refetch };
}

export function useUserPoolInfo(pid: number, userAddress: `0x${string}` | undefined) {
  const contracts: any = userAddress ? [
    {
      address: ADDR.staking as `0x${string}`,
      abi: stakingAbi,
      functionName: 'userInfo',
      args: [BigInt(pid), userAddress],
    },
    {
      address: ADDR.staking as `0x${string}`,
      abi: stakingAbi,
      functionName: 'pendingReward',
      args: [BigInt(pid), userAddress],
    },
  ] : [];

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts,
    query: {
      enabled: !!userAddress,
    },
  });

  if (!data || !userAddress) {
    return {
      userInfo: { amount: 0n, rewardDebt: 0n, pending: 0n },
      isLoading,
      error,
      refetch,
    };
  }

  const userInfoData = data[0].result as [bigint, bigint] | undefined;
  const pendingData = data[1].result as bigint | undefined;

  const userInfo: UserPoolInfo = {
    amount: userInfoData?.[0] ?? 0n,
    rewardDebt: userInfoData?.[1] ?? 0n,
    pending: pendingData ?? 0n,
  };

  return { userInfo, isLoading, error, refetch };
}

export function useAllPools() {
  const { poolLength, isLoading: lengthLoading } = usePoolLength();
  
  const poolContracts = poolLength > 0 ? Array.from({ length: poolLength }, (_, i) => ({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbi,
    functionName: 'pools' as const,
    args: [BigInt(i)] as readonly [bigint],
  })) : [];

  const { data, isLoading, error, refetch } = useReadContracts({
    contracts: poolContracts as any,
    query: {
      enabled: poolLength > 0,
    },
  });

  const pools: PoolInfo[] = data?.map((result, i) => {
    if (!result.result) return null;
    const poolData = result.result as readonly [
      `0x${string}`,
      `0x${string}`,
      bigint,
      bigint,
      bigint,
      bigint,
      bigint,
      boolean,
      string
    ];
    return {
      pid: i,
      stakeToken: poolData[0],
      rewardToken: poolData[1],
      accRewardPerShare: poolData[2],
      lastTime: poolData[3],
      rewardsPerSecond: poolData[4],
      endTime: poolData[5],
      totalStaked: poolData[6],
      paused: poolData[7],
      label: poolData[8],
    };
  }).filter(Boolean) as PoolInfo[] ?? [];

  return {
    pools,
    isLoading: lengthLoading || isLoading,
    error,
    refetch,
  };
}
