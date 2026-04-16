import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tour, TourStop, TourImages } from "@/lib/toursTypes";
import { toast } from "@/hooks/use-toast";

// Helper to parse JSON fields
const parseTour = (row: any): Tour => ({
  ...row,
  tour_type: row.tour_type || 'private',
  stops: Array.isArray(row.stops) ? row.stops : JSON.parse(row.stops || '[]'),
  images: typeof row.images === 'object' ? row.images : JSON.parse(row.images || '{"cover_url": null, "gallery_urls": []}'),
});

// Custom hook for realtime tours subscription
const useToursRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('tours-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tours'
        },
        (payload) => {
          console.log('Tours realtime update:', payload.eventType);
          // Invalidate all tour queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['tours'] });
          queryClient.invalidateQueries({ queryKey: ['tour'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

// Fetch all published tours (public)
export const usePublishedTours = () => {
  useToursRealtimeSubscription();
  
  return useQuery({
    queryKey: ['tours', 'published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('status', 'published')
        .order('popular_score', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(parseTour) as Tour[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes (reduced from 24h for better realtime)
  });
};

// Fetch single tour by slug (public)
export const useTourBySlug = (slug: string) => {
  useToursRealtimeSubscription();
  
  return useQuery({
    queryKey: ['tour', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      
      if (error) throw error;
      return parseTour(data) as Tour;
    },
    enabled: !!slug,
  });
};

// Fetch all tours (admin)
export const useAllTours = () => {
  useToursRealtimeSubscription();
  
  return useQuery({
    queryKey: ['tours', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(parseTour) as Tour[];
    },
  });
};

// Fetch single tour by ID (admin)
export const useTourById = (id: string) => {
  useToursRealtimeSubscription();
  
  return useQuery({
    queryKey: ['tour', 'id', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return parseTour(data) as Tour;
    },
    enabled: !!id,
  });
};

// Create tour mutation
export const useCreateTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tour: Partial<Tour>) => {
      // Strip fields that don't exist in the DB
      const { tour_type, created_at, updated_at, ...safeData } = tour as any;
      
      const { data, error } = await supabase
        .from('tours')
        .insert(safeData)
        .select()
        .single();
      
      if (error) throw error;
      return parseTour(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: "Tour created successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error creating tour", description: error.message, variant: "destructive" });
    },
  });
};

// Update tour mutation
export const useUpdateTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...tour }: Partial<Tour> & { id: string }) => {
      // Strip fields that don't exist in the DB or shouldn't be manually updated
      const { tour_type, created_at, updated_at, ...safeData } = tour as any;
      
      const { data, error } = await supabase
        .from('tours')
        .update(safeData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return parseTour(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: "Tour updated successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating tour", description: error.message, variant: "destructive" });
    },
  });
};

// Delete tour mutation
export const useDeleteTour = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: "Tour deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error deleting tour", description: error.message, variant: "destructive" });
    },
  });
};

// Bulk import tours mutation
export const useImportTours = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (tours: Partial<Tour>[]) => {
      const { data, error } = await supabase
        .from('tours')
        .insert(tours as any)
        .select();
      
      if (error) throw error;
      return (data || []).map(parseTour);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast({ title: `${data.length} tours imported successfully` });
    },
    onError: (error: any) => {
      toast({ title: "Error importing tours", description: error.message, variant: "destructive" });
    },
  });
};
