const ADMIN_ADDRESS = '0x9d86ab0c305633a1e77cfeadf62d07ab70e7ccf5';

export function useIsAdmin(address: string | undefined) {
  if (!address) return { data: false, isLoading: false };
  
  const isAdmin = address.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
  
  return { 
    data: isAdmin, 
    isLoading: false 
  };
}
