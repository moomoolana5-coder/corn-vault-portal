import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useIsAdmin(address: string | undefined) {
  return useQuery({
    queryKey: ['is-admin', address],
    queryFn: async () => {
      if (!address) return false;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', address.toLowerCase())
        .eq('role', 'admin')
        .maybeSingle();
      
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!address,
  });
}
