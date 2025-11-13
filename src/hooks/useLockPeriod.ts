import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LockPeriod {
  id: string;
  user_address: string;
  pool_id: number;
  lock_duration_days: number;
  locked_at: string;
  unlock_at: string;
  amount: number;
  is_active: boolean;
}

export function useActiveLockPeriod(poolId: number, userAddress: string | undefined) {
  const { data: lockPeriod, isLoading } = useQuery({
    queryKey: ['lock-period', poolId, userAddress],
    queryFn: async () => {
      if (!userAddress) return null;

      const { data, error } = await supabase
        .from('staking_locks')
        .select('*')
        .eq('pool_id', poolId)
        .eq('user_address', userAddress.toLowerCase())
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as LockPeriod | null;
    },
    enabled: !!userAddress,
  });

  const isLocked = lockPeriod ? new Date() < new Date(lockPeriod.unlock_at) : false;
  const unlockAt = lockPeriod ? new Date(lockPeriod.unlock_at) : null;
  
  return {
    lockPeriod,
    isLocked,
    unlockAt,
    isLoading,
  };
}

export function useCreateLockPeriod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      userAddress,
      poolId,
      lockDurationDays,
      amount,
    }: {
      userAddress: string;
      poolId: number;
      lockDurationDays: number;
      amount: string;
    }) => {
      const lockedAt = new Date();
      const unlockAt = new Date();
      unlockAt.setDate(unlockAt.getDate() + lockDurationDays);

      const { data, error } = await supabase
        .from('staking_locks')
        .insert({
          user_address: userAddress.toLowerCase(),
          pool_id: poolId,
          lock_duration_days: lockDurationDays,
          locked_at: lockedAt.toISOString(),
          unlock_at: unlockAt.toISOString(),
          amount: parseFloat(amount),
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lock-period', variables.poolId, variables.userAddress],
      });
    },
  });

  return {
    createLockPeriod: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
  };
}

export function useDeactivateLockPeriod() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      lockId,
      poolId,
      userAddress,
    }: {
      lockId: string;
      poolId: number;
      userAddress: string;
    }) => {
      const { data, error } = await supabase
        .from('staking_locks')
        .update({ is_active: false })
        .eq('id', lockId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['lock-period', variables.poolId, variables.userAddress],
      });
    },
  });

  return {
    deactivateLockPeriod: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useRemainingLockTime(unlockAt: Date | null) {
  const [remainingTime, setRemainingTime] = useState<string>('');

  useEffect(() => {
    if (!unlockAt) {
      setRemainingTime('');
      return;
    }

    const updateTime = () => {
      const now = new Date();
      const diff = unlockAt.getTime() - now.getTime();

      if (diff <= 0) {
        setRemainingTime('Unlocked');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setRemainingTime(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setRemainingTime(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setRemainingTime(`${minutes}m ${seconds}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [unlockAt]);

  return remainingTime;
}
