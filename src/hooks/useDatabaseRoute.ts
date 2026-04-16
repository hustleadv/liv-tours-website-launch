import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RouteData } from "@/data/routes";

// Parse route ID to extract pickup and dropoff
const parseRouteId = (routeId: string): { pickup: string; dropoff: string } | null => {
  const parts = routeId.split('-to-');
  if (parts.length !== 2) return null;
  
  // Convert kebab-case to Title Case
  const toTitleCase = (str: string) => 
    str.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  
  return {
    pickup: toTitleCase(parts[0]),
    dropoff: toTitleCase(parts[1]),
  };
};

// Default FAQs for database routes
const defaultFaqs = [
  { question: "What happens if my flight is delayed?", answer: "We track all incoming flights automatically. Your driver adjusts to your actual arrival time—no calls needed, no extra charge." },
  { question: "Is the price per person or per vehicle?", answer: "All prices are per vehicle, not per person. A sedan fits up to 4 passengers, minivan up to 8, and we can arrange minibus for larger groups." },
  { question: "Can I add an extra stop?", answer: "Yes! One short stop (supermarket, ATM) is included free. Additional stops or detours can be arranged for a small fee." },
  { question: "Do you provide child seats?", answer: "Yes, we provide baby seats, toddler seats, and boosters. Just let us know what you need when booking." },
  { question: "How do I find the driver?", answer: "Your driver will be waiting at the arrivals exit with a sign showing your name. You'll also receive their contact details beforehand." },
  { question: "Can I cancel or change my booking?", answer: "Free cancellation up to 24h before pickup. Changes can be made anytime by contacting us via WhatsApp or email." },
];

// Default what's included
const defaultWhatsIncluded = [
  "Meet & Greet service",
  "Flight monitoring for delays",
  "Fixed price, no hidden fees",
  "Door-to-door service",
  "Free cancellation 24h before",
];

// Custom hook for realtime fixed_prices subscription
const useFixedPricesRealtimeSubscription = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('fixed-prices-routes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixed_prices'
        },
        (payload) => {
          console.log('Fixed prices realtime update:', payload.eventType);
          // Invalidate database route queries to refetch fresh data
          queryClient.invalidateQueries({ queryKey: ['database-route'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};

export const useDatabaseRoute = (routeId: string | undefined) => {
  const parsed = routeId ? parseRouteId(routeId) : null;
  
  // Subscribe to realtime updates
  useFixedPricesRealtimeSubscription();
  
  return useQuery({
    queryKey: ['database-route', routeId],
    queryFn: async (): Promise<RouteData | null> => {
      if (!parsed) return null;
      
      // Fetch prices from database
      const { data: prices, error } = await supabase
        .from('fixed_prices')
        .select('fixed_price_eur, vehicle_class, region')
        .ilike('pickup_zone', `%${parsed.pickup}%`)
        .ilike('dropoff_name', `%${parsed.dropoff}%`);
      
      if (error || !prices || prices.length === 0) return null;
      
      // Find the lowest price (1-4 passengers)
      const lowestPrice = prices.reduce((min, p) => 
        p.fixed_price_eur < min ? p.fixed_price_eur : min, 
        prices[0].fixed_price_eur
      );
      
      const region = prices[0].region || 'Chania';
      const isAirport = parsed.pickup.toLowerCase().includes('airport');
      const isPort = parsed.pickup.toLowerCase().includes('port');
      
      // Construct RouteData from database
      const routeData: RouteData = {
        id: routeId!,
        from: parsed.pickup,
        to: parsed.dropoff,
        duration: "~30-45 min", // Estimate
        distance: "Varies",
        price: `€${Math.round(lowestPrice)}`,
        category: isAirport ? "airport" : isPort ? "city" : "resort",
        airport: parsed.pickup.toLowerCase().includes('chania') ? "chania" : 
                 parsed.pickup.toLowerCase().includes('heraklion') ? "heraklion" : undefined,
        isAirportRoute: isAirport,
        hasFixedPrice: true,
        fixedPriceFrom: lowestPrice,
        tag: isPort ? "port" : undefined,
        description: `Private transfer from ${parsed.pickup} to ${parsed.dropoff}. Enjoy a comfortable, stress-free journey with our professional drivers.`,
        whatsIncluded: defaultWhatsIncluded,
        faqs: defaultFaqs,
        relatedRoutes: [],
      };
      
      return routeData;
    },
    enabled: !!parsed,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
