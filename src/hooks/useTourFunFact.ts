import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FunFactData {
  funFact: string | null;
  sourceUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useTourFunFact(
  tourSlug: string | null,
  primaryStopName: string | null,
  language: string = 'en'
): FunFactData {
  const [data, setData] = useState<FunFactData>({
    funFact: null,
    sourceUrl: null,
    isLoading: false,
    error: null,
  });

  const fetchFunFact = useCallback(async () => {
    if (!tourSlug || !primaryStopName) return;

    setData(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // First check cache in database
      const { data: cached } = await supabase
        .from('tour_fun_facts')
        .select('fun_fact_text, fun_fact_source_url, fun_fact_last_generated_at, primary_stop_name')
        .eq('tour_slug', tourSlug)
        .single();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Use cache if valid
      if (cached && 
          cached.fun_fact_text && 
          cached.primary_stop_name === primaryStopName &&
          cached.fun_fact_last_generated_at &&
          new Date(cached.fun_fact_last_generated_at) > thirtyDaysAgo) {
        setData({
          funFact: cached.fun_fact_text,
          sourceUrl: cached.fun_fact_source_url,
          isLoading: false,
          error: null,
        });
        return;
      }

      // Generate new fun fact via edge function
      const { data: result, error } = await supabase.functions.invoke('generate-tour-fun-fact', {
        body: { tourSlug, primaryStopName, language },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (result?.success) {
        setData({
          funFact: result.funFact,
          sourceUrl: result.sourceUrl,
          isLoading: false,
          error: null,
        });
      } else {
        setData({
          funFact: null,
          sourceUrl: null,
          isLoading: false,
          error: result?.error || 'Failed to generate fun fact',
        });
      }
    } catch (err) {
      console.error('Fun fact fetch error:', err);
      setData({
        funFact: null,
        sourceUrl: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, [tourSlug, primaryStopName, language]);

  useEffect(() => {
    fetchFunFact();
  }, [fetchFunFact]);

  return data;
}