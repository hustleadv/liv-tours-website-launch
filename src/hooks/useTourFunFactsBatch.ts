import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FunFactsMap {
  [tourSlug: string]: {
    funFact: string;
    sourceUrl: string;
  };
}

export function useTourFunFactsBatch(tourSlugs: string[]): {
  funFacts: FunFactsMap;
  isLoading: boolean;
} {
  const [funFacts, setFunFacts] = useState<FunFactsMap>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!tourSlugs.length) return;

    const fetchFunFacts = async () => {
      setIsLoading(true);
      try {
        // Batch fetch all cached fun facts
        const { data, error } = await supabase
          .from('tour_fun_facts')
          .select('tour_slug, fun_fact_text, fun_fact_source_url')
          .in('tour_slug', tourSlugs)
          .not('fun_fact_text', 'is', null);

        if (error) {
          console.error('Error fetching fun facts batch:', error);
          return;
        }

        if (data) {
          const factsMap: FunFactsMap = {};
          data.forEach(item => {
            if (item.fun_fact_text) {
              factsMap[item.tour_slug] = {
                funFact: item.fun_fact_text,
                sourceUrl: item.fun_fact_source_url || '',
              };
            }
          });
          setFunFacts(factsMap);
        }
      } catch (err) {
        console.error('Fun facts batch fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunFacts();
  }, [tourSlugs.join(',')]); // Re-fetch when slugs change

  return { funFacts, isLoading };
}