import { useReadContract } from 'wagmi';
import { ADDR } from '@/config/addresses';
import ERC20ABI from '@/abi/ERC20.json';

export function useControllerBalances() {
  const { data: cornInController, refetch: refetchCornController } = useReadContract({
    address: ADDR.corn as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [ADDR.controller],
  });

  const { data: wplsInController, refetch: refetchWplsController } = useReadContract({
    address: ADDR.wpls as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [ADDR.controller],
  });

  const { data: cornInTreasury, refetch: refetchCornTreasury } = useReadContract({
    address: ADDR.corn as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [ADDR.treasury],
  });

  const { data: cornInStaking, refetch: refetchCornStaking } = useReadContract({
    address: ADDR.corn as `0x${string}`,
    abi: ERC20ABI,
    functionName: 'balanceOf',
    args: [ADDR.staking],
  });

  const refetchAll = () => {
    refetchCornController();
    refetchWplsController();
    refetchCornTreasury();
    refetchCornStaking();
  };

  return {
    cornInController: cornInController as bigint | undefined,
    wplsInController: wplsInController as bigint | undefined,
    cornInTreasury: cornInTreasury as bigint | undefined,
    cornInStaking: cornInStaking as bigint | undefined,
    refetchAll,
  };
}
