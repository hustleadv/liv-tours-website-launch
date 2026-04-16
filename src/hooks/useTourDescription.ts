import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tour } from '@/lib/toursTypes';

interface UseTourDescriptionResult {
  description: string | null;
  isLoading: boolean;
  isAIGenerated: boolean;
  regenerate: () => Promise<void>;
}

export function useTourDescription(tour: Tour | null): UseTourDescriptionResult {
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAIGenerated, setIsAIGenerated] = useState(false);

  const generateDescription = async () => {
    if (!tour) return;

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-tour-description', {
        body: {
          tourSlug: tour.slug,
          tourTitle: tour.title,
          stops: tour.stops,
          region: tour.region,
          category: tour.category,
          highlights: tour.highlights
        }
      });

      if (error) {
        console.error('Error generating description:', error);
        // Fall back to existing description
        setDescription(tour.description || null);
        setIsAIGenerated(false);
      } else if (data?.description) {
        setDescription(data.description);
        setIsAIGenerated(true);
      }
    } catch (err) {
      console.error('Failed to generate description:', err);
      setDescription(tour.description || null);
      setIsAIGenerated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!tour) {
      setDescription(null);
      return;
    }

    // Check if we have a cached AI description (stored in source_summary)
    // Make sure it's not JSON metadata by checking if it starts with { or [
    if (tour.source_summary && 
        tour.source_summary.length > 200 && 
        !tour.source_summary.trim().startsWith('{') &&
        !tour.source_summary.trim().startsWith('[')) {
      setDescription(tour.source_summary);
      setIsAIGenerated(true);
      return;
    }

    // If we have a database description, use it directly (no AI generation needed)
    if (tour.description && tour.description.length > 100) {
      setDescription(tour.description);
      setIsAIGenerated(false);
      return;
    }

    // Only generate AI description if no existing description
    setDescription(tour.description || null);
    generateDescription();
  }, [tour?.slug]);

  return {
    description,
    isLoading,
    isAIGenerated,
    regenerate: generateDescription
  };
}
