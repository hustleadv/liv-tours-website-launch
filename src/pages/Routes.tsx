import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowRight, 
  Search, 
  MapPin, 
  Clock, 
  Plane,
  Building2,
  Palmtree,
  Route as RouteIcon,
  MessageCircle,
  Filter,
  Waves,
  TrendingUp,
  DollarSign,
  Ship,
  Euro,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Anchor,
  Flame,
  Star
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import TrustBar from "@/components/TrustBar";
import FinalCTABlock from "@/components/FinalCTABlock";
import SEOHead from "@/components/SEOHead";
import PageHero from "@/components/PageHero";
import WeatherChip from "@/components/WeatherChip";
import FixedPricesTable from "@/components/FixedPricesTable";

import { routes, filterRoutes, RouteData } from "@/data/routes";
import { trackEvent } from "@/lib/tracking";
import { useIsMobile } from "@/hooks/use-mobile";
import { getWeatherLocation } from "@/lib/weatherLocations";
import { supabase } from "@/integrations/supabase/client";
import routesHero from "@/assets/routes-hero-new.webp";

// Type for fixed price routes from database
interface FixedPriceRoute {
  id: string;
  from: string;
  to: string;
  price: string;
  priceNum: number;
  pickupZone: string;
  region: string;
  isFromDb: true;
  allPrices: {
    '1-4'?: number;
    '5-8'?: number;
    '9-11'?: number;
    '12-16'?: number;
    '17+'?: number;
  };
}

type SortOption = 'popular' | 'price' | 'duration';

// Placeholder popularity scores
const POPULARITY_SCORES: Record<string, number> = {
  'chania-airport-to-chania-old-town': 100,
  'chania-airport-to-platanias': 88,
  'chania-airport-to-agia-marina': 78,
  'souda-port-to-chania': 85,
  'chania-airport-to-rethymno': 82,
};

// Fuzzy search helper - Levenshtein distance
const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();
  
  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[bLower.length][aLower.length];
};

const Routes = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePickupZone, setActivePickupZone] = useState("all");
  const [activeRegion, setActiveRegion] = useState("all");
  const [activeVehicle, setActiveVehicle] = useState("Taxi");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price');
  const [isSticky, setIsSticky] = useState(false);
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [searchSuggestion, setSearchSuggestion] = useState<string | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteRoutes, setAutocompleteRoutes] = useState<FixedPriceRoute[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const heroRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Vehicle class options with icons and descriptions
  const vehicleClasses = [
    { id: '1-4', label: 'E-Class', passengers: '1-4', icon: '🚗' },
    { id: '5-8', label: 'Sprinter', passengers: '5-8', icon: '🚙' },
    { id: '9-11', label: 'Sprinter', passengers: '9-11', icon: '🚐' },
    { id: '12-16', label: 'Sprinter Maxi', passengers: '12-16', icon: '🚌' },
    { id: '17+', label: 'Sprinter Maxi', passengers: '17+', icon: '🚌' },
  ];

  // Fetch ALL fixed prices from database (all vehicle types)
  const { data: fixedPricesData, isLoading, refetch } = useQuery({
    queryKey: ['fixed-prices-routes-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fixed_prices')
        .select('dropoff_name, pickup_zone, region, fixed_price_eur, vehicle_class')
        .order('fixed_price_eur', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Realtime subscription for price updates
  useEffect(() => {
    const channel = supabase
      .channel('routes-fixed-prices-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fixed_prices'
        },
        () => {
          // Refetch data when prices change
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Skeleton card component
  const SkeletonCard = () => (
    <div className="bg-card rounded-2xl border border-border/50 p-5 animate-pulse">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="h-6 bg-muted rounded w-32" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-16" />
      </div>
      <div className="pt-4 border-t border-border/50 flex items-center justify-between">
        <div>
          <div className="h-3 bg-muted rounded w-10 mb-1" />
          <div className="h-8 bg-muted rounded w-16" />
        </div>
        <div className="h-9 bg-muted rounded w-20" />
      </div>
    </div>
  );

  // Group fixed prices by route and include all vehicle prices
  const fixedPriceRoutes: FixedPriceRoute[] = useMemo(() => {
    if (!fixedPricesData) return [];
    
    type VehicleClassKey = '1-4' | '5-8' | '9-11' | '12-16' | '17+';
    
    // Group by pickup_zone + dropoff_name
    const grouped: Record<string, {
      pickup_zone: string;
      dropoff_name: string;
      region: string;
      prices: { '1-4'?: number; '5-8'?: number; '9-11'?: number; '12-16'?: number; '17+'?: number };
    }> = {};
    
    fixedPricesData.forEach((fp) => {
      const key = `${fp.pickup_zone}-${fp.dropoff_name}`;
      if (!grouped[key]) {
        grouped[key] = {
          pickup_zone: fp.pickup_zone,
          dropoff_name: fp.dropoff_name,
          region: fp.region,
          prices: {},
        };
      }
      const vehicleClass = fp.vehicle_class as VehicleClassKey;
      if (['1-4', '5-8', '9-11', '12-16', '17+'].includes(vehicleClass)) {
        grouped[key].prices[vehicleClass] = fp.fixed_price_eur;
      }
    });
    
    return Object.entries(grouped).map(([key, data]) => {
      // Use 1-4 price as the main price (lowest), fallback to others
      const mainPrice = data.prices['1-4'] ?? data.prices['5-8'] ?? data.prices['9-11'] ?? data.prices['12-16'] ?? data.prices['17+'] ?? 0;
      
      return {
        id: `db-${key}`.toLowerCase().replace(/\s+/g, '-'),
        from: data.pickup_zone,
        to: data.dropoff_name,
        price: `€${Math.round(mainPrice)}`,
        priceNum: mainPrice,
        pickupZone: data.pickup_zone,
        region: data.region,
        isFromDb: true as const,
        allPrices: data.prices,
      };
    });
  }, [fixedPricesData]);

  // Get unique pickup zones for filtering
  const pickupZones = useMemo(() => {
    const zones = [...new Set(fixedPriceRoutes.map(r => r.pickupZone))];
    return [
      { id: 'all', label: 'All Pickup Points' },
      ...zones.map(zone => ({
        id: zone,
        label: zone,
        icon: zone.includes('Port') ? Anchor : Plane
      }))
    ];
  }, [fixedPriceRoutes]);

  // Get unique regions for filtering
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(fixedPriceRoutes.map(r => r.region))];
    return [
      { id: 'all', label: 'All Regions' },
      ...uniqueRegions.map(region => ({
        id: region,
        label: region
      }))
    ];
  }, [fixedPriceRoutes]);

  // Sticky search effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Embla carousel for mobile swipeable cards
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });
  
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  const categories = [
    { id: "all", label: "All Routes", icon: RouteIcon },
    { id: "airport", label: "Airport", icon: Plane },
    { id: "port", label: "Port", icon: Anchor },
  ];

  const sortOptions: { id: SortOption; label: string; icon: React.ReactNode }[] = [
    { id: 'price', label: 'Price', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'popular', label: 'A-Z', icon: <TrendingUp className="w-4 h-4" /> },
  ];

  // Filter and sort fixed price routes
  const filteredAndSortedRoutes = useMemo(() => {
    let result = [...fixedPriceRoutes];
    
    // Filter by pickup zone
    if (activePickupZone !== 'all') {
      result = result.filter(route => route.pickupZone === activePickupZone);
    }
    
    // Filter by region
    if (activeRegion !== 'all') {
      result = result.filter(route => route.region === activeRegion);
    }
    
    // Filter by category (airport/port) - use whole-word matching
    if (activeCategory === 'airport') {
      result = result.filter(route => /\bairport\b/i.test(route.pickupZone));
    } else if (activeCategory === 'port') {
      result = result.filter(route => /\bport\b/i.test(route.pickupZone));
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(route => 
        route.to.toLowerCase().includes(term) || 
        route.from.toLowerCase().includes(term) ||
        route.region.toLowerCase().includes(term)
      );
    }
    
    // Sort routes
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceNum - b.priceNum;
        case 'popular':
          return a.to.localeCompare(b.to);
        default:
          return 0;
      }
    });
    
    return result;
  }, [fixedPriceRoutes, activePickupZone, activeRegion, activeCategory, searchTerm, sortBy]);

  // Count port routes for badge
  const portRoutesCount = useMemo(() => {
    return fixedPriceRoutes.filter(r => r.pickupZone.toLowerCase().includes('port')).length;
  }, [fixedPriceRoutes]);

  // Get all unique destination names for fuzzy matching
  const allDestinations = useMemo(() => {
    const destinations = new Set<string>();
    fixedPriceRoutes.forEach(route => {
      destinations.add(route.to);
      destinations.add(route.from);
      destinations.add(route.region);
    });
    return Array.from(destinations);
  }, [fixedPriceRoutes]);

  // Find best fuzzy match suggestion
  const findSuggestion = useCallback((term: string): string | null => {
    if (term.length < 3) return null;
    
    const termLower = term.toLowerCase();
    
    // Check if there's an exact or partial match - no suggestion needed
    const hasMatch = allDestinations.some(dest => 
      dest.toLowerCase().includes(termLower) || termLower.includes(dest.toLowerCase())
    );
    if (hasMatch) return null;
    
    // Find best fuzzy match
    let bestMatch: string | null = null;
    let bestDistance = Infinity;
    
    for (const dest of allDestinations) {
      const distance = levenshteinDistance(term, dest);
      // Only suggest if distance is reasonable (< 40% of word length)
      const threshold = Math.max(3, Math.floor(dest.length * 0.4));
      if (distance < bestDistance && distance <= threshold) {
        bestDistance = distance;
        bestMatch = dest;
      }
    }
    
    return bestMatch;
  }, [allDestinations]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    
    // Find suggestion for typos
    const suggestion = findSuggestion(value);
    setSearchSuggestion(suggestion);
    
    // Generate autocomplete results - show matching routes directly
    if (value.length >= 2) {
      const termLower = value.toLowerCase();
      const matchingRoutes = fixedPriceRoutes
        .filter(route => 
          route.to.toLowerCase().includes(termLower) || 
          route.from.toLowerCase().includes(termLower)
        )
        .sort((a, b) => {
          // Prioritize destination matches that start with the term
          const aStarts = a.to.toLowerCase().startsWith(termLower);
          const bStarts = b.to.toLowerCase().startsWith(termLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.to.localeCompare(b.to);
        })
        .slice(0, 5);
      setAutocompleteRoutes(matchingRoutes);
      setShowAutocomplete(matchingRoutes.length > 0);
    } else {
      setAutocompleteRoutes([]);
      setShowAutocomplete(false);
    }
    
    if (value.length >= 3) {
      trackEvent('routes_search', { pickup: value });
    }
  };

  const selectAutocomplete = (value: string) => {
    setSearchTerm(value);
    setShowAutocomplete(false);
    setAutocompleteRoutes([]);
    setSearchSuggestion(null);
    setHighlightedIndex(-1);
  };

  const applySuggestion = () => {
    if (searchSuggestion) {
      setSearchTerm(searchSuggestion);
      setSearchSuggestion(null);
    }
  };

  // Helper to generate route URL
  const getRouteUrl = (route: FixedPriceRoute) => {
    return `/routes/${route.from.toLowerCase().replace(/\s+/g, '-')}-to-${route.to.toLowerCase().replace(/\s+/g, '-')}`;
  };

  // Keyboard navigation for autocomplete
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || autocompleteRoutes.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < autocompleteRoutes.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteRoutes.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < autocompleteRoutes.length) {
          // Navigate to route page
          window.location.href = getRouteUrl(autocompleteRoutes[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [autocompleteRoutes]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        autocompleteRef.current && 
        !autocompleteRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowAutocomplete(false);
        setHighlightedIndex(-1);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    trackEvent('routes_filter_apply', { category: categoryId });
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
    trackEvent('routes_sort_change', { source: sort });
  };

  const FixedPriceCard = ({ route, index = 0 }: { route: FixedPriceRoute, index?: number }) => {
    const pickupLower = route.pickupZone.toLowerCase();
    const isAirport = /\bairport\b/.test(pickupLower);
    const isPort = /\bport\b/.test(pickupLower);
    const isExpanded = expandedRoute === route.id;
    const isPopular = POPULARITY_SCORES[route.id] > 80;
    
    const handleCardClick = () => {
      setExpandedRoute(isExpanded ? null : route.id);
    };
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.4, delay: (index % 12) * 0.05 }}
        className={`group relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer border ${
          isExpanded 
            ? 'glass-card border-accent/40 shadow-lg shadow-accent/10' 
            : 'bg-card border-border/80 hover:border-accent/30 hover:shadow-md'
        }`}
        onClick={handleCardClick}
      >
        {isPopular && (
          <div className="absolute top-0 right-0 z-10">
            <div className="bg-gradient-to-r from-accent to-lime text-background text-[9px] font-black uppercase tracking-widest py-1 px-3 rounded-bl-xl shadow-sm flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" /> Popular
            </div>
          </div>
        )}

        <div className={`p-5 relative z-0 transition-colors ${isExpanded ? 'bg-primary/5' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-1.5">
              {isAirport ? <Plane className="w-3.5 h-3.5" /> : isPort ? <Anchor className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
              {isAirport ? 'Airport' : isPort ? 'Port' : route.region}
            </span>
          </div>

          <h3 className="text-lg font-bold text-foreground mb-1 mt-3 group-hover:text-accent transition-colors pr-12 line-clamp-1 leading-tight">
            {route.to}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4">
            from {route.from}
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <div>
               <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-0.5">Starting at</p>
               <div className="flex items-baseline gap-1.5">
                 <span className="text-2xl font-black text-foreground drop-shadow-sm">{route.price}</span>
                 <span className="text-xs font-medium text-muted-foreground">/ 1-4 pax</span>
               </div>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isExpanded ? 'bg-accent/10 text-accent rotate-180' : 'bg-muted text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent'}`}>
              <div className="relative flex items-center justify-center w-3.5 h-3.5">
                <span className="absolute w-3.5 h-[2px] bg-current rounded-full" />
                <span className={`absolute w-3.5 h-[2px] bg-current rounded-full transition-all duration-300 ${isExpanded ? 'rotate-0 opacity-0' : 'rotate-90'}`} />
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 bg-muted/10 border-t border-border/50">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-3">
              {Object.entries(route.allPrices).map(([pax, price]) => (
                <div key={pax} className="flex items-center justify-between py-1.5 px-2 text-sm">
                  <span className="text-muted-foreground">{pax} pax</span>
                  <span className="font-semibold text-foreground">€{Math.round(price as number)}</span>
                </div>
              ))}
            </div>
              <Link 
                to={getRouteUrl(route)}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 block w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-center text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md"
              >
                View full details →
              </Link>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <Layout>
      <SEOHead
        title="Luxury Transfer Routes & Fixed Prices in Chania & Heraklion | LIV Tours"
        description="Explore premium taxi and minibus transfer routes across Crete. Guaranteed fixed pricing from Chania Airport (CHQ) and Souda Port. No hidden fees, professional drivers."
        keywords="Chania airport transfers, Heraklion airport taxi, Crete private tours, luxury transport Chania, fixed price taxi Crete"
        canonicalUrl="https://livtours.gr/routes"
      />
      
      <PageHero
        label="Fixed Prices · No Hidden Fees"
        title="Luxury Transfer"
        titleAccent="Routes & Prices"
        subtitle="Premium, fixed-rate transportation across Crete. Whether you need a Chania Airport taxi or a VIP private transfer for a group, we provide transparent pricing with no hidden fees."
        image={routesHero}
        icon={ShieldCheck}
        overlay="dark"
        serifAccent
      >
        <div className="flex flex-col items-center gap-8 mt-6">
          {/* Trust Badge - Homepage Style */}
          <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/10 backdrop-blur-2xl rounded-full border border-white/20 shadow-2xl">
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-accent fill-accent" />
              ))}
            </div>
            <div className="w-px h-5 bg-white/20" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-white">5.0 on Google Chania</span>
          </div>

          <div className="w-full max-w-2xl mx-auto relative group">
            <div className="relative flex items-center">
              <Search className="absolute left-5 w-5 h-5 text-muted-foreground z-10" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search destinations... (Platanias, Rethymno, Elounda)"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => autocompleteRoutes.length > 0 && setShowAutocomplete(true)}
                className="pl-14 pr-6 h-14 text-base bg-white border-0 shadow-2xl shadow-black/20 rounded-xl focus-visible:ring-accent w-full"
              />
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && autocompleteRoutes.length > 0 && (
              <div 
                ref={autocompleteRef}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl shadow-black/20 border border-border/20 overflow-hidden z-50 transition-all duration-300"
              >
                {autocompleteRoutes.map((route, index) => {
                  const termLower = searchTerm.toLowerCase();
                  const destLower = route.to.toLowerCase();
                  const matchIndex = destLower.indexOf(termLower);
                  
                  let highlightedDest: React.ReactNode = route.to;
                  if (matchIndex >= 0 && searchTerm.length > 0) {
                    const before = route.to.slice(0, matchIndex);
                    const match = route.to.slice(matchIndex, matchIndex + searchTerm.length);
                    const after = route.to.slice(matchIndex + searchTerm.length);
                    highlightedDest = (
                      <>
                        {before}
                        <span className="text-primary font-bold">{match}</span>
                        {after}
                      </>
                    );
                  }

                  const pickupLower = route.pickupZone.toLowerCase();
                  const isAirport = /\bairport\b/.test(pickupLower);
                  const isPort = /\bport\b/.test(pickupLower);
                  
                  return (
                    <Link
                      key={route.id}
                      to={getRouteUrl(route)}
                      onClick={() => setShowAutocomplete(false)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors ${
                        index !== autocompleteRoutes.length - 1 ? 'border-b border-border/10' : ''
                      } ${
                        highlightedIndex === index 
                          ? 'bg-primary/5' 
                          : 'hover:bg-muted/30'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isAirport ? 'bg-sky-50' : isPort ? 'bg-blue-50' : 'bg-muted/30'
                      }`}>
                        {isAirport ? (
                          <Plane className="w-5 h-5 text-sky-600" />
                        ) : isPort ? (
                          <Anchor className="w-5 h-5 text-blue-600" />
                        ) : (
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-primary truncate">{highlightedDest}</div>
                        <div className="text-xs text-muted-foreground truncate">from {route.from}</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-sm font-black text-accent">{route.price}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold">1-4 pax</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PageHero>

      <div className="bg-background">
        <TrustBar />
      </div>

      {/* Main Routes Section */}
      <section className="section-padding" id="explore">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Crete Travel Guide</div>
            <h2 className="section-heading text-balance mx-auto">
              Popular Transfer <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Destinations</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              LIV Tours connects you to every corner of Crete. From Chania Airport (CHQ) to luxury resorts in Elounda and hidden gems in Rethymno, explore our most popular routes with guaranteed fixed pricing and premium service.
            </p>
          </div>

          {/* Sticky Filtering Bar */}
          <div 
            className={`transition-all duration-300 z-40 mb-12 ${
              isSticky 
                ? "sticky top-20 py-4 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm -mx-4 px-4 lg:-mx-8 lg:px-8" 
                : ""
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Category Toggles */}
              <div className="flex items-center gap-1.5 p-1 bg-muted rounded-xl overflow-x-auto no-scrollbar w-full lg:w-auto shadow-inner">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-black transition-all whitespace-nowrap ${
                      activeCategory === category.id
                        ? "bg-white text-primary shadow-sm"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Filters & Sorting */}
              <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto no-scrollbar pb-1 lg:pb-0">
                <select 
                  value={activePickupZone}
                  onChange={(e) => setActivePickupZone(e.target.value)}
                  className="h-11 px-5 rounded-xl bg-muted border-none text-sm font-bold focus:ring-2 focus:ring-accent transition-all cursor-pointer min-w-[180px] shadow-inner"
                >
                  {pickupZones.map(zone => (
                    <option key={zone.id} value={zone.id}>{zone.label}</option>
                  ))}
                </select>

                <select 
                  value={activeRegion}
                  onChange={(e) => setActiveRegion(e.target.value)}
                  className="h-11 px-5 rounded-xl bg-muted border-none text-sm font-bold focus:ring-2 focus:ring-accent transition-all cursor-pointer min-w-[160px] shadow-inner"
                >
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-xl shadow-inner">
                  {sortOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSortChange(option.id)}
                      className={`p-2.5 rounded-lg transition-all ${
                        sortBy === option.id
                          ? "bg-white text-accent shadow-sm"
                          : "text-muted-foreground hover:text-primary"
                      }`}
                      title={`Sort by ${option.label}`}
                    >
                      {option.icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Grid Content */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredAndSortedRoutes.length > 0 ? (
              filteredAndSortedRoutes.map((route, index) => (
                <FixedPriceCard key={route.id} route={route} index={index} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass-card border-dashed">
                <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-primary mb-2">No routes found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search term.</p>
                <Button 
                  variant="outline" 
                  className="mt-6"
                  onClick={() => {
                    setSearchTerm("");
                    setActiveCategory("all");
                    setActivePickupZone("all");
                    setActiveRegion("all");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Information Table Section */}
      <section className="section-padding bg-cream-warm">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center mb-16 px-4">
            <div className="section-subheading">Fixed Flat Rates</div>
            <h2 className="section-heading text-balance mx-auto">
              Pricing <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Information</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our rates are transparent and inclusive of all taxes, fees, and standard amenities. Select the vehicle class that best fits your needs.
            </p>
          </div>
          <FixedPricesTable />
        </div>
      </section>

      {/* SEO Informational Section */}
      <section className="section-padding overflow-hidden">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-1 space-y-6">
              <div className="section-subheading">Professional Service Standards</div>
              <h2 className="section-heading text-left">
                The Gold Standard in <span className="text-accent italic font-serif underline decoration-accent/20 underline-offset-8">Crete Transfers</span>
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  At LIV Tours, our professional drivers are experts in navigating the diverse landscapes of Crete. 
                  Whether you require a swift <strong>Chania Airport transfer</strong> or a scenic route to <strong>Heraklion</strong> or <strong>Agios Nikolaos</strong>, 
                  we prioritize safety, punctuality, and luxury above all else.
                </p>
                <p>
                  All our vehicles—from executive sedans to spacious minibuses—are equipped with free high-speed WiFi and advanced climate control 
                  to ensure your journey is as comfortable as your destination. We serve all major hubs including <strong>Souda Port</strong> and 
                  <strong>Heraklion Airport (HER)</strong>, providing reliable 24/7 transportation for discerning travelers.
                </p>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src={routesHero} 
                  alt="Professional Chania Transfer Service" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 glass-card p-6 shadow-xl hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-primary">Fully Insured</div>
                    <div className="text-xs text-muted-foreground">Premium Fleet Protection</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FinalCTABlock 
        title="Can't find your destination?"
        subtitle="We provide custom transfers to any location in Crete. Chat with us for a personalized quote."
        badge="Custom Routes"
        primaryButtonText="Contact Us for Quote"
        whatsappMessage="Hi! I couldn't find my specific destination on your routes page. Can you provide a quote?"
      />
    </Layout>
  );
};

export default Routes;
