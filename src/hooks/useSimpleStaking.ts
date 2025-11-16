import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { ADDR } from '@/config/addresses';
import simpleStakingAbi from '@/abi/SimpleStaking.json';
import erc20Abi from '@/abi/ERC20.json';
import { parseUnits, formatUnits } from 'viem';
import { pulsechain } from '@/lib/chains';
import { toast } from '@/hooks/use-toast';

// Pool configuration
export const STAKING_POOLS = [
  { id: 0, stakeToken: ADDR.corn, rewardToken: ADDR.wpls, stakeName: '🌽 CORN', rewardName: 'WPLS', stakeDecimals: 18, rewardDecimals: 18 },
  { id: 1, stakeToken: ADDR.corn, rewardToken: ADDR.usdc, stakeName: '🌽 CORN', rewardName: 'USDC', stakeDecimals: 18, rewardDecimals: 6 },
  { id: 2, stakeToken: ADDR.xcorn, rewardToken: ADDR.wpls, stakeName: 'xCORN', rewardName: 'WPLS', stakeDecimals: 18, rewardDecimals: 18 },
  { id: 3, stakeToken: ADDR.xcorn, rewardToken: ADDR.usdc, stakeName: 'xCORN', rewardName: 'USDC', stakeDecimals: 18, rewardDecimals: 6 },
  { id: 4, stakeToken: ADDR.usdc, rewardToken: ADDR.corn, stakeName: 'USDC', rewardName: '🌽 CORN', stakeDecimals: 6, rewardDecimals: 18 },
  { id: 5, stakeToken: ADDR.wpls, rewardToken: ADDR.corn, stakeName: 'WPLS', rewardName: '🌽 CORN', stakeDecimals: 18, rewardDecimals: 18 },
];

export interface SimplePool {
  id: number;
  stakeToken: string;
  rewardToken: string;
  rewardPerSecond: bigint;
  totalStaked: bigint;
  active: boolean;
  stakeName: string;
  rewardName: string;
  stakeDecimals: number;
  rewardDecimals: number;
}

// Hook to check if user is owner
export function useIsOwner() {
  const { address } = useAccount();
  
  const { data: ownerAddress, isLoading } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: simpleStakingAbi,
    chainId: pulsechain.id,
    functionName: 'owner',
  });

  const isOwner = address && ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();

  return { isOwner, isLoading, ownerAddress: ownerAddress as string | undefined };
}

// Hook to get pool info
export function usePoolInfo(poolId: number) {
  const config = STAKING_POOLS[poolId];
  
  const { data, isLoading, error, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: simpleStakingAbi,
    chainId: pulsechain.id,
    functionName: 'pools',
    args: [BigInt(poolId)],
  });

  const pool: SimplePool = data ? {
    id: poolId,
    stakeToken: (data as any)[0],
    rewardToken: (data as any)[1],
    rewardPerSecond: (data as any)[2],
    totalStaked: (data as any)[3],
    active: (data as any)[4],
    stakeName: config.stakeName,
    rewardName: config.rewardName,
    stakeDecimals: config.stakeDecimals,
    rewardDecimals: config.rewardDecimals,
  } : {
    id: poolId,
    stakeToken: config.stakeToken,
    rewardToken: config.rewardToken,
    rewardPerSecond: 0n,
    totalStaked: 0n,
    active: false,
    stakeName: config.stakeName,
    rewardName: config.rewardName,
    stakeDecimals: config.stakeDecimals,
    rewardDecimals: config.rewardDecimals,
  };

  return { pool, isLoading, error, refetch };
}

// Hook to get all pools
export function useAllPools() {
  const pool0 = usePoolInfo(0);
  const pool1 = usePoolInfo(1);
  const pool2 = usePoolInfo(2);
  const pool3 = usePoolInfo(3);
  const pool4 = usePoolInfo(4);
  const pool5 = usePoolInfo(5);

  const pools = [pool0.pool, pool1.pool, pool2.pool, pool3.pool, pool4.pool, pool5.pool].filter(Boolean) as SimplePool[];
  const isLoading = pool0.isLoading || pool1.isLoading || pool2.isLoading || pool3.isLoading || pool4.isLoading || pool5.isLoading;

  const refetch = () => {
    pool0.refetch();
    pool1.refetch();
    pool2.refetch();
    pool3.refetch();
    pool4.refetch();
    pool5.refetch();
  };

  return { pools, isLoading, refetch };
}

// Hook to get user staked amount
export function useUserStaked(poolId: number, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: simpleStakingAbi,
    chainId: pulsechain.id,
    functionName: 'userStaked',
    args: userAddress ? [BigInt(poolId), userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  return {
    staked: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get pending rewards
export function usePendingReward(poolId: number, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: ADDR.staking as `0x${string}`,
    abi: simpleStakingAbi,
    chainId: pulsechain.id,
    functionName: 'pendingReward',
    args: userAddress ? [BigInt(poolId), userAddress] : undefined,
    query: {
      enabled: !!userAddress,
      refetchInterval: 10000,
    },
  });

  return {
    pending: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Hook to get token balance
export function useTokenBalance(tokenAddress: string, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    chainId: pulsechain.id,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Hook to check allowance
export function useAllowance(tokenAddress: string, userAddress: `0x${string}` | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    chainId: pulsechain.id,
    functionName: 'allowance',
    args: userAddress ? [userAddress, ADDR.staking] : undefined,
    query: { enabled: !!userAddress },
  });

  return {
    allowance: data as bigint | undefined,
    isLoading,
    refetch,
  };
}

// Hook to approve token
export function useApproveToken() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (tokenAddress: string, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [ADDR.staking, amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Approval Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to stake
export function useStake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const stake = async (poolId: number, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: simpleStakingAbi,
        functionName: 'stake',
        args: [BigInt(poolId), amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Stake Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    stake,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to unstake
export function useUnstake() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const unstake = async (poolId: number, amount: string, decimals: number) => {
    try {
      const amountWei = parseUnits(amount, decimals);
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: simpleStakingAbi,
        functionName: 'unstake',
        args: [BigInt(poolId), amountWei],
      } as any);
    } catch (err) {
      toast({
        title: 'Unstake Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return {
    unstake,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  };
}

// Hook to claim rewards
export function useClaim() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claim = async (poolId: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: simpleStakingAbi,
        functionName: 'claim',
        args: [BigInt(poolId)],
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
