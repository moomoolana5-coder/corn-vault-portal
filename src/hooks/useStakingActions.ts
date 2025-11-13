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
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({ 
    hash,
    query: {
      enabled: !!hash,
    }
  });

  const withdraw = async (pid: number, amount: string, decimals: number) => {
    try {
      const amountBigInt = parseUnits(amount, decimals);
      
      console.log('Withdraw params:', {
        pid,
        amount,
        decimals,
        amountBigInt: amountBigInt.toString(),
        stakingContract: ADDR.staking,
      });
      
      writeContract({
        address: ADDR.staking as `0x${string}`,
        abi: stakingAbi,
        functionName: 'withdraw',
        args: [BigInt(pid), amountBigInt],
      } as any);
    } catch (err) {
      console.error('Withdraw writeContract error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction rejected';
      
      // Check for common error patterns
      if (errorMessage.includes('ERC20_CALL_FAIL') || errorMessage.includes('transfer failed')) {
        toast({
          title: 'Insufficient Reward Tokens',
          description: 'The staking contract does not have enough reward tokens. Please contact the pool administrator or try harvesting rewards separately.',
          variant: 'destructive',
        });
      } else if (errorMessage.includes('insufficient')) {
        toast({
          title: 'Insufficient Balance',
          description: 'You do not have enough staked tokens to withdraw this amount.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Withdraw Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
      throw err;
    }
  };

  return { 
    withdraw, 
    hash, 
    isPending: isPending || isConfirming, 
    isSuccess, 
    isError,
    error 
  };
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

  const { writeContractAsync, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (amount: string, decimals: number) => {
    try {
      // Use max uint256 for unlimited approval
      const amountBigInt = amount === 'max' 
        ? BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
        : parseUnits(amount, decimals);
      
      await writeContractAsync({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [ADDR.staking as `0x${string}`, amountBigInt],
      } as any);
    } catch (err) {
      // Some tokens require resetting allowance to 0 before setting a new non-zero value
      try {
        await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [ADDR.staking as `0x${string}`, 0n],
        } as any);
        await writeContractAsync({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: 'approve',
          args: [ADDR.staking as `0x${string}`, amount === 'max' 
            ? BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff') 
            : parseUnits(amount, decimals)],
        } as any);
      } catch (e2) {
        toast({
          title: 'Approval Failed',
          description: e2 instanceof Error ? e2.message : 'Unknown error',
          variant: 'destructive',
        });
        throw e2;
      }
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
