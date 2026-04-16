import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseIsAdminReturn {
  isAdmin: boolean;
  isLoading: boolean;
}

export function useIsAdmin(): UseIsAdminReturn {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Check if user has admin role using the has_role function
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setIsAdmin(data === true);
      setIsLoading(false);
    };

    checkAdmin();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdmin();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { isAdmin, isLoading };
}
