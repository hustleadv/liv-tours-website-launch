import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PICKUP_ZONES, clearPricesCache } from '@/lib/fixedPrices';
import { resolveLocationAlias } from './useLocationAliases';

interface RoutePrices {
  '1-4'?: number;
  '5-8'?: number;
  '9-11'?: number;
  '12-16'?: number;
  '17+'?: number;
}

interface UseAllRoutePricesParams {
  pickup: string;
  dropoff: string;
}

export function useAllRoutePrices({ pickup, dropoff }: UseAllRoutePricesParams) {
  const [prices, setPrices] = useState<RoutePrices | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('fixed-prices-all-routes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixed_prices'
        },
        () => {
          // Clear cache and trigger refresh
          clearPricesCache();
          setRefreshTrigger(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const fetchAllPrices = async () => {
      if (!pickup || !dropoff) {
        setPrices(null);
        return;
      }

      setIsLoading(true);

      try {
        // Resolve pickup alias from database first
        const resolvedPickup = await resolveLocationAlias(pickup, 'pickup');
        const pickupLower = resolvedPickup.toLowerCase();
        
        // Find matching pickup zone
        let matchedZone: string | undefined = PICKUP_ZONES.find(zone => {
          const zoneLower = zone.toLowerCase();
          return pickupLower.includes(zoneLower) || zoneLower.includes(pickupLower.replace(' airport', '').replace(' port', ''));
        });

        // If resolved pickup matches a zone exactly, use it
        if (!matchedZone) {
          matchedZone = PICKUP_ZONES.find(zone => 
            zone.toLowerCase() === pickupLower
          );
        }

        if (!matchedZone) {
          setPrices(null);
          setIsLoading(false);
          return;
        }

        // Resolve dropoff alias from database
        const dropoffNormalized = await resolveLocationAlias(dropoff, 'dropoff');

        // Fetch all vehicle class prices for this route
        const { data, error } = await supabase
          .from('fixed_prices')
          .select('vehicle_class, fixed_price_eur')
          .ilike('pickup_zone', `%${matchedZone}%`)
          .ilike('dropoff_name', `%${dropoffNormalized}%`);

        if (error) {
          console.error('Error fetching route prices:', error);
          setPrices(null);
          setIsLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const routePrices: RoutePrices = {};
          data.forEach(row => {
            const vc = row.vehicle_class as keyof RoutePrices;
            if (['1-4', '5-8', '9-11', '12-16', '17+'].includes(vc)) {
              routePrices[vc] = row.fixed_price_eur;
            }
          });
          setPrices(Object.keys(routePrices).length > 0 ? routePrices : null);
        } else {
          setPrices(null);
        }
      } catch (error) {
        console.error('Error in useAllRoutePrices:', error);
        setPrices(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPrices();
  }, [pickup, dropoff, refreshTrigger]);

  return { prices, isLoading };
}
