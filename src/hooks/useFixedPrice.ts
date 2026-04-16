import { useState, useEffect } from 'react';
import { findFixedPrice, FixedPrice, PICKUP_ZONES, clearPricesCache } from '@/lib/fixedPrices';
import { supabase } from '@/integrations/supabase/client';

interface UseFixedPriceParams {
  pickup: string;
  dropoff: string;
  vehicleType: string;
  passengers: string;
}

export function useFixedPrice({ pickup, dropoff, vehicleType, passengers }: UseFixedPriceParams) {
  const [fixedPrice, setFixedPrice] = useState<FixedPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('fixed-prices-hook')
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
    const checkFixedPrice = async () => {
      if (!pickup || !dropoff || !vehicleType || !passengers) {
        setFixedPrice(null);
        return;
      }

      setIsLoading(true);

      try {
        const passengersNum = parseInt(passengers) || 1;
        
        // Map vehicleType to vehicle class - use the selected vehicle type, not just passengers
        let vehicleClass = '';
        if (vehicleType === 'taxi') {
          vehicleClass = '1-4';
        } else if (vehicleType === 'minivan') {
          // For minivan, check passenger count to determine 5-8 or 9-11
          if (passengersNum >= 9 && passengersNum <= 11) {
            vehicleClass = '9-11';
          } else {
            vehicleClass = '5-8';
          }
        } else if (vehicleType === 'minibus') {
          // For minibus, check passenger count to determine 12-16 or 17+
          if (passengersNum >= 17) {
            vehicleClass = '17+';
          } else {
            vehicleClass = '12-16';
          }
        } else {
          // Fallback: map by passenger count
          if (passengersNum >= 1 && passengersNum <= 4) {
            vehicleClass = '1-4';
          } else if (passengersNum >= 5 && passengersNum <= 8) {
            vehicleClass = '5-8';
          } else if (passengersNum >= 9 && passengersNum <= 11) {
            vehicleClass = '9-11';
          } else if (passengersNum >= 12 && passengersNum <= 16) {
            vehicleClass = '12-16';
          } else if (passengersNum >= 17) {
            vehicleClass = '17+';
          }
        }
        
        if (!vehicleClass) {
          setFixedPrice(null);
          return;
        }
        
        // Try to match pickup to a known pickup zone
        const pickupLower = pickup.toLowerCase();
        const matchedZone = PICKUP_ZONES.find(zone => {
          const zoneLower = zone.toLowerCase();
          return pickupLower.includes(zoneLower) || zoneLower.includes(pickupLower.replace(' airport', '').replace(' port', ''));
        });

        if (!matchedZone) {
          // Try more flexible matching
          const zoneKeywords: Record<string, string[]> = {
            'Chania Airport': ['chania airport', 'chq', 'αεροδρόμιο χανίων'],
            'Chania City': ['chania city', 'chania center', 'χανιά'],
            'Souda Port': ['souda', 'σούδα', 'port'],
            'Rethymno City': ['rethymno', 'ρέθυμνο'],
            'Heraklion Airport': ['heraklion airport', 'her', 'αεροδρόμιο ηρακλείου'],
            'Heraklion City': ['heraklion city', 'heraklion center', 'ηράκλειο'],
            'Heraklion Port': ['heraklion port'],
          };

          let foundZone: string | null = null;
          for (const [zone, keywords] of Object.entries(zoneKeywords)) {
            if (keywords.some(kw => pickupLower.includes(kw))) {
              foundZone = zone;
              break;
            }
          }

          if (!foundZone) {
            setFixedPrice(null);
            setIsLoading(false);
            return;
          }

          const price = await findFixedPrice(foundZone, dropoff, vehicleClass, passengersNum);
          setFixedPrice(price);
        } else {
          const price = await findFixedPrice(matchedZone, dropoff, vehicleClass, passengersNum);
          setFixedPrice(price);
        }
      } catch (error) {
        console.error('Error checking fixed price:', error);
        setFixedPrice(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkFixedPrice();
  }, [pickup, dropoff, vehicleType, passengers, refreshTrigger]);

  return { fixedPrice, isLoading };
}
