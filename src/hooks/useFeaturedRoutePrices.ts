import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getFeaturedRoutes, RouteData } from '@/data/routes';

interface RouteWithLivePrice extends RouteData {
  livePrice: number | null;
  isLoadingPrice: boolean;
}

export function useFeaturedRoutePrices() {
  const [routes, setRoutes] = useState<RouteWithLivePrice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      const featuredRoutes = getFeaturedRoutes();
      
      // Initialize routes with loading state
      setRoutes(featuredRoutes.map(route => ({
        ...route,
        livePrice: null,
        isLoadingPrice: true
      })));

      // Fetch prices from database for each route
      const routesWithPrices = await Promise.all(
        featuredRoutes.map(async (route) => {
          try {
            // Map route pickup to database pickup_zone
            const pickupZone = mapToPickupZone(route.from);
            const dropoffName = route.to;

            if (!pickupZone) {
              return {
                ...route,
                livePrice: route.fixedPriceFrom || null,
                isLoadingPrice: false
              };
            }

            // Query for the lowest price (sedan/1-4 passengers)
            const { data, error } = await supabase
              .from('fixed_prices')
              .select('fixed_price_eur')
              .ilike('pickup_zone', `%${pickupZone}%`)
              .ilike('dropoff_name', `%${dropoffName}%`)
              .eq('passengers_min', 1)
              .eq('passengers_max', 4)
              .limit(1)
              .maybeSingle();

            if (error || !data) {
              // Fallback to static price
              return {
                ...route,
                livePrice: route.fixedPriceFrom || null,
                isLoadingPrice: false
              };
            }

            return {
              ...route,
              livePrice: data.fixed_price_eur,
              isLoadingPrice: false
            };
          } catch {
            return {
              ...route,
              livePrice: route.fixedPriceFrom || null,
              isLoadingPrice: false
            };
          }
        })
      );

      setRoutes(routesWithPrices);
      setIsLoading(false);
    };

    fetchPrices();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('featured-route-prices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixed_prices'
        },
        () => {
          // Refetch prices on any change
          fetchPrices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { routes, isLoading };
}

// Map route location names to database pickup zones
function mapToPickupZone(location: string): string | null {
  const lowerLocation = location.toLowerCase();
  
  if (lowerLocation.includes('chania airport') || lowerLocation.includes('chq')) {
    return 'Chania Airport';
  }
  if (lowerLocation.includes('heraklion airport') || lowerLocation.includes('her')) {
    return 'Heraklion Airport';
  }
  if (lowerLocation.includes('souda port')) {
    return 'Souda Port';
  }
  if (lowerLocation.includes('kissamos port')) {
    return 'Kissamos Port';
  }
  
  return null;
}
