import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { ADDR } from '@/config/addresses';
import { stakingAbi } from '@/abi/StakingContract';
import { erc20Abi } from '@/lib/abis/erc20';
import { toast } from '@/hooks/use-toast';

export function useStakingDeposit() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const deposit = async (pid: number, amount: string, decimals: number) => {
    try {
      const amountBigInt = parseUnits(amount, decimals);
      
      console.log('Deposit params:', {
        pid,
        amount,
        decimals,
        amountBigInt: amountBigInt.toString(),
        stakingContract: ADDR.staking,
      });
      
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'deposit',
        args: [BigInt(pid), amountBigInt],
      } as any);
    } catch (err) {
      console.error('Deposit writeContract error:', err);
      toast({
        title: 'Deposit Failed',
        description: err instanceof Error ? err.message : 'Transaction rejected',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return { deposit, hash, isPending: isPending || isConfirming, isSuccess, error };
}

export function useStakingWithdraw() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const withdraw = async (pid: number, amount: string, decimals: number) => {
    try {
      const amountBigInt = parseUnits(amount, decimals);
      
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'withdraw',
        args: [BigInt(pid), amountBigInt],
      } as any);
    } catch (err) {
      toast({
        title: 'Withdraw Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return { withdraw, hash, isPending: isPending || isConfirming, isSuccess, error };
}

export function useStakingHarvest() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const harvest = async (pid: number) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
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

  return { harvest, hash, isPending: isPending || isConfirming, isSuccess, error };
}

export function useStakingClaimAll() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const claimAll = async (pids: number[]) => {
    try {
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
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

  return { claimAll, hash, isPending: isPending || isConfirming, isSuccess, error };
}

export function useTokenApproval(tokenAddress: `0x${string}`, userAddress: `0x${string}` | undefined) {
  const { data: allowance, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: userAddress ? [userAddress, ADDR.staking as `0x${string}`] : undefined,
    query: {
      enabled: !!userAddress,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string, decimals: number) => {
    try {
      // Use max uint256 for unlimited approval
      const amountBigInt = amount === 'max' 
        ? BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        : parseUnits(amount, decimals);
      
      writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [ADDR.staking as `0x${string}`, amountBigInt],
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
    allowance: allowance as bigint | undefined,
    approve,
    isPending: isPending || isConfirming,
    isSuccess,
    refetch,
  };
}
