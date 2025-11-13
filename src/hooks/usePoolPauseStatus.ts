import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PoolPauseStatus {
  id: string;
  pool_id: number;
  is_paused: boolean;
  paused_by: string | null;
  paused_at: string | null;
  updated_at: string;
}

export function usePoolPauseStatus(poolId: number) {
  return useQuery({
    queryKey: ['pool-pause-status', poolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pool_pause_status')
        .select('*')
        .eq('pool_id', poolId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // If no record exists, return default (not paused)
      if (!data) {
        return {
          pool_id: poolId,
          is_paused: false,
        } as PoolPauseStatus;
      }
      
      return data as PoolPauseStatus;
    },
  });
}

export function useTogglePoolPause() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      poolId, 
      isPaused,
      pausedBy 
    }: { 
      poolId: number; 
      isPaused: boolean;
      pausedBy: string;
    }) => {
      // First check if record exists
      const { data: existing } = await supabase
        .from('pool_pause_status')
        .select('id')
        .eq('pool_id', poolId)
        .maybeSingle();

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('pool_pause_status')
          .update({ 
            is_paused: isPaused,
            paused_by: pausedBy,
            paused_at: isPaused ? new Date().toISOString() : null
          })
          .eq('pool_id', poolId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('pool_pause_status')
          .insert({ 
            pool_id: poolId,
            is_paused: isPaused,
            paused_by: pausedBy,
            paused_at: isPaused ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pool-pause-status'] });
      toast({
        title: "Success",
        description: data.is_paused ? "Pool paused in UI" : "Pool unpaused in UI",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
