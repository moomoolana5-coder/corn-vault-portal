import { useReadContract } from 'wagmi';
import { ADDR } from '@/config/addresses';
import { stakingAbi } from '@/abi/StakingContract';
import { formatUnits } from 'viem';
import { useState, useEffect } from 'react';

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
  // Use individual reads instead of useReadContracts to avoid type inference issues
  const { data: userInfoData, isLoading: userInfoLoading } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbi,
    functionName: 'userInfo',
    args: [BigInt(pid), userAddress!],
    query: {
      enabled: !!userAddress,
    },
  });

  const { data: pendingData, isLoading: pendingLoading, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: stakingAbi,
    functionName: 'pendingReward',
    args: [BigInt(pid), userAddress!],
    query: {
      enabled: !!userAddress,
    },
  });

  if (!userAddress) {
    return {
      userInfo: { amount: 0n, rewardDebt: 0n, pending: 0n },
      isLoading: false,
      error: null,
      refetch,
    };
  }

  const userData = userInfoData as [bigint, bigint] | undefined;

  const userInfo: UserPoolInfo = {
    amount: userData?.[0] ?? 0n,
    rewardDebt: userData?.[1] ?? 0n,
    pending: (pendingData as bigint) ?? 0n,
  };

  return { 
    userInfo, 
    isLoading: userInfoLoading || pendingLoading, 
    error: null,
    refetch 
  };
}

export function useAllPools() {
  const { poolLength, isLoading: lengthLoading } = usePoolLength();
  
  // Hardcode max 20 pools and always call hooks unconditionally
  const MAX_POOLS = 20;
  
  const pool0 = usePoolInfo(0);
  const pool1 = usePoolInfo(1);
  const pool2 = usePoolInfo(2);
  const pool3 = usePoolInfo(3);
  const pool4 = usePoolInfo(4);
  const pool5 = usePoolInfo(5);
  const pool6 = usePoolInfo(6);
  const pool7 = usePoolInfo(7);
  const pool8 = usePoolInfo(8);
  const pool9 = usePoolInfo(9);
  const pool10 = usePoolInfo(10);
  const pool11 = usePoolInfo(11);
  const pool12 = usePoolInfo(12);
  const pool13 = usePoolInfo(13);
  const pool14 = usePoolInfo(14);
  const pool15 = usePoolInfo(15);
  const pool16 = usePoolInfo(16);
  const pool17 = usePoolInfo(17);
  const pool18 = usePoolInfo(18);
  const pool19 = usePoolInfo(19);

  const allPoolResults = [
    pool0, pool1, pool2, pool3, pool4, pool5, pool6, pool7, pool8, pool9,
    pool10, pool11, pool12, pool13, pool14, pool15, pool16, pool17, pool18, pool19
  ];

  // Only include pools up to poolLength
  const pools = allPoolResults
    .slice(0, poolLength)
    .map(result => result.pool)
    .filter(Boolean) as PoolInfo[];

  const isLoading = lengthLoading || allPoolResults.slice(0, poolLength).some(r => r.isLoading);

  const refetch = () => {
    allPoolResults.forEach(r => r.refetch());
  };

  return {
    pools,
    isLoading,
    error: null,
    refetch,
  };
}
