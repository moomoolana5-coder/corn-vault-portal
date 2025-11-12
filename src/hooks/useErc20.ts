import { useReadContract } from 'wagmi';
import { erc20Abi } from '@/lib/abis/erc20';
import { formatUnits } from '@/lib/format';
import { DEAD_ADDRESS } from '@/lib/chains';

export function useTokenMeta(address: `0x${string}`) {
  const { data: name } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: 'name',
  });

  const { data: symbol } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: 'symbol',
  });

  const { data: decimals } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: 'decimals',
  });

  const { data: totalSupply, isLoading, error } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: 'totalSupply',
  });

  return {
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    decimals: decimals as number | undefined,
    totalSupply: totalSupply as bigint | undefined,
    isLoading,
    error,
  };
}

export function useBalanceOf(tokenAddress: `0x${string}`, walletAddress: `0x${string}` | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: walletAddress ? [walletAddress] : undefined,
    query: {
      enabled: !!walletAddress,
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
    refetch,
  };
}

export function useDeadBalance(tokenAddress: `0x${string}`) {
  const { data, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [DEAD_ADDRESS],
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
  };
}

export function useFormattedBalance(
  tokenAddress: `0x${string}`,
  walletAddress: `0x${string}` | undefined,
  decimals?: number
) {
  const { balance, isLoading, error, refetch } = useBalanceOf(tokenAddress, walletAddress);

  const formatted = balance && decimals !== undefined ? formatUnits(balance, decimals) : '0';

  return {
    balance,
    formatted,
    isLoading,
    error,
    refetch,
  };
}
