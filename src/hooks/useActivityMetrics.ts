import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ActivityMetric {
  id: string;
  metric_name: string;
  value: number;
  updated_at: string;
  updated_by: string | null;
}

export function useActivityMetrics() {
  return useQuery({
    queryKey: ['activity-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_metrics')
        .select('*')
        .order('metric_name');
      
      if (error) throw error;
      return data as ActivityMetric[];
    },
  });
}

export function useUpdateActivityMetric() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      metricName, 
      value, 
      updatedBy 
    }: { 
      metricName: string; 
      value: number; 
      updatedBy?: string;
    }) => {
      const { data, error } = await supabase
        .from('activity_metrics')
        .update({ 
          value,
          updated_by: updatedBy || null
        })
        .eq('metric_name', metricName)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-metrics'] });
      toast({
        title: "Success",
        description: "Metric updated successfully",
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
