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
          cache: 'no-cache', // Don't cache auth requests
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          console.log('Auth success - user data:', userData);
          return userData;
        } else if (response.status === 401) {
          console.log('Auth failed - user not authenticated');
          return null;
        } else {
          console.error('Auth error - unexpected status:', response.status);
          throw new Error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Auth error - network/other:', error);
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