import { useAccount } from 'wagmi';
import { useAllPools } from '@/hooks/useSimpleStaking';
import { SimpleStakingCard } from '@/components/SimpleStakingCard';
import { Loader2 } from 'lucide-react';

export default function SimpleStaking() {
  const { address, isConnected } = useAccount();
  const { pools, isLoading, refetch } = useAllPools();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Staking Pools</h1>
        <p className="text-muted-foreground">
          Stake your tokens to earn rewards
        </p>
      </div>

      {pools.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No staking pools available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools.map((pool) => (
            <SimpleStakingCard
              key={pool.id}
              pool={pool}
              walletAddress={address}
              isConnected={isConnected}
              onRefresh={refetch}
            />
          ))}
        </div>
      )}
    </div>
  );
}
