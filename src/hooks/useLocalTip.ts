import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/tracking';

export interface LocalTipData {
  tip: string;
  source: 'manual' | 'cached' | 'generated' | 'fallback' | 'error_fallback';
  confidence: number;
  sourceSummary?: string;
  isLoading: boolean;
  error?: string;
}

interface UseLocalTipOptions {
  locationId: string;
  locationName: string;
  lat?: number;
  lon?: number;
  locationType?: 'beach' | 'airport' | 'port' | 'city' | 'resort' | 'attraction' | 'general';
}

// Fallback tips for immediate display while loading
const FALLBACK_TIPS: Record<string, string> = {
  beach: "Go early morning for calmer waters and fewer crowds. Bring water.",
  airport: "Keep WhatsApp on for real-time pickup updates from your driver.",
  port: "Ferries can be delayed—your driver monitors and adjusts automatically.",
  city: "Best explored on foot. Wear comfortable shoes for cobblestones.",
  resort: "Book dinner reservations early in peak season.",
  attraction: "Visit early morning or late afternoon to avoid crowds.",
  general: "Ask your driver for their favorite local spot.",
};

export function useLocalTip(options: UseLocalTipOptions): LocalTipData & {
  refetch: () => Promise<void>;
  getAlternatives: () => Promise<string[]>;
  setManualTip: (tip: string) => Promise<boolean>;
} {
  const { locationId, locationName, lat, lon, locationType = 'general' } = options;
  
  const [data, setData] = useState<LocalTipData>({
    tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general,
    source: 'fallback',
    confidence: 0.3,
    isLoading: true,
  });

  const fetchTip = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, isLoading: true }));

      // First check database cache
      const { data: cachedTip } = await supabase
        .from('location_tips')
        .select('*')
        .eq('location_id', locationId)
        .single();

      if (cachedTip) {
        // Manual override takes priority
        if (cachedTip.is_manual_override && cachedTip.manual_tip) {
          setData({
            tip: cachedTip.manual_tip,
            source: 'manual',
            confidence: 1.0,
            isLoading: false,
          });
          trackEvent('local_tip_view', { locationId, source: 'manual' });
          return;
        }

        // Check if cached tip is recent (less than 30 days)
        const lastUpdated = cachedTip.last_updated 
          ? new Date(cachedTip.last_updated) 
          : null;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        if (lastUpdated && lastUpdated > thirtyDaysAgo && cachedTip.tip_text) {
          setData({
            tip: cachedTip.tip_text,
            source: 'cached',
            confidence: cachedTip.confidence || 0.5,
            sourceSummary: cachedTip.source_summary || undefined,
            isLoading: false,
          });
          trackEvent('local_tip_view', { locationId, source: 'cached' });
          return;
        }
      }

      // Generate new tip via edge function
      const { data: result, error } = await supabase.functions.invoke('generate-local-tip', {
        body: {
          locationId,
          locationName,
          lat,
          lon,
          locationType,
          action: 'generate',
        },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (error) {
        console.error('Error generating tip:', error);
        setData({
          tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general,
          source: 'error_fallback',
          confidence: 0.2,
          isLoading: false,
          error: error.message,
        });
        trackEvent('local_tip_fallback_used', { locationId, reason: 'api_error' });
        return;
      }

      setData({
        tip: result.tip,
        source: result.source,
        confidence: result.confidence,
        sourceSummary: result.sourceSummary,
        isLoading: false,
      });

      if (result.source === 'fallback' || result.source === 'error_fallback') {
        trackEvent('local_tip_fallback_used', { locationId, reason: 'low_confidence' });
      } else {
        trackEvent('local_tip_generated', { locationId, confidence: result.confidence });
      }
      trackEvent('local_tip_view', { locationId, source: result.source });

    } catch (error) {
      console.error('Error in useLocalTip:', error);
      setData({
        tip: FALLBACK_TIPS[locationType] || FALLBACK_TIPS.general,
        source: 'error_fallback',
        confidence: 0.2,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      trackEvent('local_tip_fallback_used', { locationId, reason: 'exception' });
    }
  }, [locationId, locationName, lat, lon, locationType]);

  const getAlternatives = useCallback(async (): Promise<string[]> => {
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-local-tip', {
        body: {
          locationId,
          locationName,
          lat,
          lon,
          locationType,
          action: 'alternatives',
        },
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
      });

      if (error || !result.success) {
        console.error('Error getting alternatives:', error);
        return [];
      }

      return result.alternatives || [];
    } catch (error) {
      console.error('Error getting alternatives:', error);
      return [];
    }
  }, [locationId, locationName, lat, lon, locationType]);

  const setManualTip = useCallback(async (tip: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('location_tips')
        .upsert({
          location_id: locationId,
          location_name: locationName,
          lat,
          lon,
          location_type: locationType,
          manual_tip: tip,
          is_manual_override: true,
          last_updated: new Date().toISOString(),
        }, {
          onConflict: 'location_id',
        });

      if (error) {
        console.error('Error setting manual tip:', error);
        return false;
      }

      setData({
        tip,
        source: 'manual',
        confidence: 1.0,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Error setting manual tip:', error);
      return false;
    }
  }, [locationId, locationName, lat, lon, locationType]);

  useEffect(() => {
    fetchTip();
  }, [fetchTip]);

  return {
    ...data,
    refetch: fetchTip,
    getAlternatives,
    setManualTip,
  };
}
