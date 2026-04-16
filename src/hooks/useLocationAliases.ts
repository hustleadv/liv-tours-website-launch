import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationAlias {
  alias: string;
  canonical_name: string;
  location_type: 'dropoff' | 'pickup';
}

// Cache for aliases
let aliasesCache: LocationAlias[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch location aliases from database with caching
 */
export async function getLocationAliases(): Promise<LocationAlias[]> {
  const now = Date.now();
  
  if (aliasesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return aliasesCache;
  }
  
  const { data, error } = await supabase
    .from('location_aliases')
    .select('alias, canonical_name, location_type')
    .eq('is_active', true);
  
  if (error) {
    console.error('Error fetching location aliases:', error);
    return aliasesCache || [];
  }
  
  aliasesCache = data as LocationAlias[];
  cacheTimestamp = now;
  
  return aliasesCache;
}

/**
 * Clear aliases cache (call when aliases are updated)
 */
export function clearAliasesCache(): void {
  aliasesCache = null;
  cacheTimestamp = 0;
}

/**
 * Resolve a location name to its canonical database name
 */
export async function resolveLocationAlias(
  location: string,
  locationType: 'dropoff' | 'pickup' = 'dropoff'
): Promise<string> {
  const aliases = await getLocationAliases();
  const locationLower = location.toLowerCase().trim();
  
  // Find matching alias
  const match = aliases.find(
    a => a.location_type === locationType && locationLower.includes(a.alias.toLowerCase())
  );
  
  return match ? match.canonical_name : location;
}

/**
 * Hook to use location aliases with auto-refresh
 */
export function useLocationAliases() {
  const [aliases, setAliases] = useState<LocationAlias[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAliases = async () => {
      const data = await getLocationAliases();
      setAliases(data);
      setIsLoading(false);
    };

    fetchAliases();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('location-aliases-hook')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'location_aliases' },
        () => {
          clearAliasesCache();
          fetchAliases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { aliases, isLoading };
}
