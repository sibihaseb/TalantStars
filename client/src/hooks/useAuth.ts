import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetch: () => void;
}

export function useAuth(): AuthContextType {
  const { data: user, isLoading, refetch } = useQuery<User | null>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/user', {
          credentials: 'include',
        });
        
        if (response.ok) {
          return await response.json();
        } else if (response.status === 401) {
          // User is not authenticated
          return null;
        } else {
          throw new Error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Auth error:', error);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
    refetch,
  };
}