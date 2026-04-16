import { supabase } from "@/integrations/supabase/client";
import { resolveLocationAlias } from "@/hooks/useLocationAliases";

export interface FixedPrice {
  id: string;
  region: string;
  pickup_zone: string;
  dropoff_name: string;
  vehicle_class: string;
  passengers_min: number;
  passengers_max: number;
  fixed_price_eur: number;
  currency: string;
  is_fixed_price: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ParsedPriceRow {
  dropoff_name: string;
  fixed_price_eur: number;
  region: string;
  pickup_zone: string;
  vehicle_class: string;
  passengers_min: number;
  passengers_max: number;
  isValid: boolean;
  error?: string;
}

// Cache for fixed prices
let pricesCache: FixedPrice[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Setup realtime subscription for cache invalidation
let realtimeSubscribed = false;

export function setupRealtimeSubscription(): void {
  if (realtimeSubscribed) return;
  
  const channel = supabase
    .channel('fixed-prices-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'fixed_prices'
      },
      () => {
        // Invalidate cache on any change
        pricesCache = null;
        cacheTimestamp = 0;
        console.log('[FixedPrices] Cache invalidated due to realtime update');
      }
    )
    .subscribe();
  
  realtimeSubscribed = true;
}

export const REGIONS = ['Chania', 'Rethymno', 'Heraklion', 'Lasithi'] as const;

export const PICKUP_ZONES = [
  'Chania Airport',
  'Chania City',
  'Souda Port',
  'Rethymno City',
  'Heraklion Airport',
  'Heraklion City',
  'Heraklion Port',
] as const;

export const VEHICLE_CLASSES = ['1-4', '5-8', '9-11', '12-16', '17+'] as const;

export const VEHICLE_CLASS_CONFIG = {
  '1-4': { label: 'Sedan', passengers_min: 1, passengers_max: 4 },
  '5-8': { label: 'Large', passengers_min: 5, passengers_max: 8 },
  '9-11': { label: 'Minivan', passengers_min: 9, passengers_max: 11 },
  '12-16': { label: 'Minibus S', passengers_min: 12, passengers_max: 16 },
  '17+': { label: 'Minibus L', passengers_min: 17, passengers_max: 30 },
} as const;

export type Region = typeof REGIONS[number];
export type PickupZone = typeof PICKUP_ZONES[number];
export type VehicleClass = typeof VEHICLE_CLASSES[number];

/**
 * Parse pasted text into price rows
 */
export function parsePastedPrices(
  text: string,
  defaults: {
    region: string;
    pickup_zone: string;
    vehicle_class: string;
    passengers_min: number;
    passengers_max: number;
  }
): ParsedPriceRow[] {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  return lines.map(line => {
    const trimmed = line.trim();
    
    // Remove currency symbols and extra spaces
    const cleaned = trimmed
      .replace(/€/g, '')
      .replace(/EUR/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Try to match: "Destination Name 42.00" or "Destination Name 42,00" or "Destination Name 42"
    const match = cleaned.match(/^(.+?)\s+([\d,\.]+)$/);
    
    if (!match) {
      return {
        dropoff_name: trimmed,
        fixed_price_eur: 0,
        ...defaults,
        isValid: false,
        error: 'Could not parse price',
      };
    }
    
    const [, destination, priceStr] = match;
    
    // Convert comma to dot and parse as number
    const price = parseFloat(priceStr.replace(',', '.'));
    
    if (isNaN(price) || price <= 0) {
      return {
        dropoff_name: destination.trim(),
        fixed_price_eur: 0,
        ...defaults,
        isValid: false,
        error: 'Invalid price value',
      };
    }
    
    return {
      dropoff_name: destination.trim(),
      fixed_price_eur: price,
      ...defaults,
      isValid: true,
    };
  });
}

/**
 * Fetch all fixed prices with caching
 */
export async function getFixedPrices(forceRefresh = false): Promise<FixedPrice[]> {
  // Setup realtime subscription on first call
  setupRealtimeSubscription();
  
  const now = Date.now();
  
  if (!forceRefresh && pricesCache && (now - cacheTimestamp) < CACHE_TTL) {
    return pricesCache;
  }
  
  const { data, error } = await supabase
    .from('fixed_prices')
    .select('*')
    .order('dropoff_name');
  
  if (error) {
    console.error('Error fetching fixed prices:', error);
    return pricesCache || [];
  }
  
  pricesCache = data as FixedPrice[];
  cacheTimestamp = now;
  
  return pricesCache;
}

/**
 * Search for a fixed price by route
 */
export async function findFixedPrice(
  pickupZone: string,
  dropoffName: string,
  vehicleClass: string,
  passengers: number
): Promise<FixedPrice | null> {
  const prices = await getFixedPrices();
  
  // Resolve both pickup and dropoff aliases from database
  const resolvedPickup = await resolveLocationAlias(pickupZone, 'pickup');
  const resolvedDropoff = await resolveLocationAlias(dropoffName, 'dropoff');
  const pickupNormalized = resolvedPickup.toLowerCase();
  const dropoffNormalized = resolvedDropoff.toLowerCase();
  
  // Find matching price
  const match = prices.find(p => 
    p.pickup_zone.toLowerCase() === pickupNormalized &&
    p.dropoff_name.toLowerCase() === dropoffNormalized &&
    p.vehicle_class.toLowerCase() === vehicleClass.toLowerCase() &&
    passengers >= p.passengers_min &&
    passengers <= p.passengers_max
  );
  
  return match || null;
}

/**
 * Get unique destinations for autocomplete
 */
export async function getDestinations(): Promise<string[]> {
  const prices = await getFixedPrices();
  const destinations = [...new Set(prices.map(p => p.dropoff_name))];
  return destinations.sort();
}

/**
 * Get available pickup zones for a destination
 */
export async function getPickupZonesForDestination(dropoffName: string): Promise<string[]> {
  const prices = await getFixedPrices();
  const zones = prices
    .filter(p => p.dropoff_name.toLowerCase() === dropoffName.toLowerCase())
    .map(p => p.pickup_zone);
  return [...new Set(zones)];
}

/**
 * Get available vehicle classes for a route
 */
export async function getVehicleClassesForRoute(
  pickupZone: string,
  dropoffName: string
): Promise<string[]> {
  const prices = await getFixedPrices();
  const classes = prices
    .filter(p => 
      p.pickup_zone.toLowerCase() === pickupZone.toLowerCase() &&
      p.dropoff_name.toLowerCase() === dropoffName.toLowerCase()
    )
    .map(p => p.vehicle_class);
  return [...new Set(classes)];
}

/**
 * Import prices to database
 */
export async function importPrices(
  rows: ParsedPriceRow[]
): Promise<{ imported: number; updated: number; skipped: number; errors: string[] }> {
  const validRows = rows.filter(r => r.isValid);
  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];
  
  for (const row of validRows) {
    const { isValid, error, ...priceData } = row;
    
    // Try to upsert
    const { data, error: upsertError } = await supabase
      .from('fixed_prices')
      .upsert(
        {
          ...priceData,
          currency: 'EUR',
          is_fixed_price: true,
          tags: [],
        },
        {
          onConflict: 'pickup_zone,dropoff_name,vehicle_class,passengers_max',
        }
      )
      .select();
    
    if (upsertError) {
      errors.push(`${row.dropoff_name}: ${upsertError.message}`);
      skipped++;
    } else if (data && data.length > 0) {
      // Check if it was an update or insert by comparing timestamps
      const record = data[0];
      const createdAt = new Date(record.created_at).getTime();
      const updatedAt = new Date(record.updated_at).getTime();
      
      if (Math.abs(updatedAt - createdAt) < 1000) {
        imported++;
      } else {
        updated++;
      }
    }
  }
  
  // Invalidate cache
  pricesCache = null;
  
  return { imported, updated, skipped, errors };
}

/**
 * Delete a fixed price
 */
export async function deleteFixedPrice(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('fixed_prices')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting price:', error);
    return false;
  }
  
  // Invalidate cache
  pricesCache = null;
  return true;
}

/**
 * Clear cache
 */
export function clearPricesCache(): void {
  pricesCache = null;
  cacheTimestamp = 0;
}
