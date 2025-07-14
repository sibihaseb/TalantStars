import { useState, useEffect } from "react";
import type { User, UserProfile } from "@shared/schema";

type UserWithProfile = User & { profile?: UserProfile };

export function useAuth() {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/user", {
          credentials: "include",
        });
        
        if (res.status === 401) {
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        if (!res.ok) {
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        
        const userData = await res.json();
        setUser(userData);
        setIsLoading(false);
      } catch (error) {
        // If it's a 401 error, set user to null
        if (error instanceof Error && error.message.includes("401")) {
          setUser(null);
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}
