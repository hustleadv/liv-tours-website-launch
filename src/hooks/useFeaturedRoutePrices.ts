import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getFeaturedRoutes, RouteData } from '@/data/routes';

interface RouteWithLivePrice extends RouteData {
  livePrice: number | null;
  isLoadingPrice: boolean;
}

export function useFeaturedRoutePrices() {
  const featuredRoutes = getFeaturedRoutes();
  
  const { data, isLoading } = useQuery({
    queryKey: ['featured-route-prices'],
    queryFn: async () => {
      // Map pickup zones
      const pickupZones = featuredRoutes
        .map(r => mapToPickupZone(r.from))
        .filter(Boolean) as string[];
      
      const dropoffNames = featuredRoutes.map(r => r.to);

      // Fetch all prices in ONE query
      const { data: prices, error } = await supabase
        .from('fixed_prices')
        .select('fixed_price_eur, pickup_zone, dropoff_name')
        .in('pickup_zone', pickupZones)
        .in('dropoff_name', dropoffNames)
        .eq('passengers_min', 1)
        .eq('passengers_max', 4);

      if (error) {
        console.error("Error fetching featured prices:", error);
        return featuredRoutes.map(route => ({
          ...route,
          livePrice: route.fixedPriceFrom || null,
          isLoadingPrice: false
        }));
      }

      // Map prices back to routes
      return featuredRoutes.map(route => {
        const pickupZone = mapToPickupZone(route.from);
        const match = prices?.find(p => 
          p.pickup_zone === pickupZone && 
          p.dropoff_name === route.to
        );
        
        return {
          ...route,
          livePrice: match ? match.fixed_price_eur : (route.fixedPriceFrom || null),
          isLoadingPrice: false
        };
      });
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  return { 
    routes: data || featuredRoutes.map(r => ({ ...r, livePrice: r.fixedPriceFrom || null, isLoadingPrice: true })), 
    isLoading 
  };
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
