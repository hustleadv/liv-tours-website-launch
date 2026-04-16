import { useState, useEffect, useCallback, useRef } from 'react';
import { trackEvent, TrackingEvent } from '@/lib/tracking';

// Location data with categories
export interface Location {
  id: string;
  name: string;
  category: 'airport' | 'city' | 'resort' | 'beach' | 'port' | 'hotel' | 'landmark' | 'village';
  shortCode?: string;
  area?: string;
}

export const LOCATIONS: Location[] = [
  // Airports
  { id: 'chania-airport', name: 'Chania Airport (CHQ)', category: 'airport', shortCode: 'CHQ' },
  { id: 'heraklion-airport', name: 'Heraklion Airport (HER)', category: 'airport', shortCode: 'HER' },
  
  // Ports
  { id: 'souda-port', name: 'Souda Port', category: 'port', area: 'Chania' },
  { id: 'heraklion-port', name: 'Heraklion Port', category: 'port', area: 'Heraklion' },
  
  // Cities
  { id: 'chania-old-town', name: 'Chania Old Town', category: 'city', area: 'Chania' },
  { id: 'chania-center', name: 'Chania City Center', category: 'city', area: 'Chania' },
  { id: 'rethymno', name: 'Rethymno', category: 'city', area: 'Rethymno' },
  { id: 'rethymno-old-town', name: 'Rethymno Old Town', category: 'city', area: 'Rethymno' },
  { id: 'heraklion-city', name: 'Heraklion City Center', category: 'city', area: 'Heraklion' },
  { id: 'agios-nikolaos', name: 'Agios Nikolaos', category: 'city', area: 'Lasithi' },
  { id: 'ierapetra', name: 'Ierapetra', category: 'city', area: 'Lasithi' },
  { id: 'sitia', name: 'Sitia', category: 'city', area: 'Lasithi' },
  
  // Popular Resort Areas
  { id: 'platanias', name: 'Platanias', category: 'resort', area: 'Chania' },
  { id: 'agia-marina', name: 'Agia Marina', category: 'resort', area: 'Chania' },
  { id: 'kato-stalos', name: 'Kato Stalos', category: 'resort', area: 'Chania' },
  { id: 'kalyves', name: 'Kalyves', category: 'resort', area: 'Chania' },
  { id: 'almyrida', name: 'Almyrida', category: 'resort', area: 'Chania' },
  { id: 'georgioupolis', name: 'Georgioupolis', category: 'resort', area: 'Chania' },
  { id: 'kavros', name: 'Kavros', category: 'resort', area: 'Chania' },
  { id: 'bali', name: 'Bali', category: 'resort', area: 'Rethymno' },
  { id: 'panormo', name: 'Panormo', category: 'resort', area: 'Rethymno' },
  { id: 'hersonissos', name: 'Hersonissos', category: 'resort', area: 'Heraklion' },
  { id: 'malia', name: 'Malia', category: 'resort', area: 'Heraklion' },
  { id: 'stalis', name: 'Stalis', category: 'resort', area: 'Heraklion' },
  { id: 'kokkini-hani', name: 'Kokkini Hani', category: 'resort', area: 'Heraklion' },
  { id: 'ammoudara', name: 'Ammoudara', category: 'resort', area: 'Heraklion' },
  { id: 'agia-pelagia', name: 'Agia Pelagia', category: 'resort', area: 'Heraklion' },
  { id: 'elounda', name: 'Elounda', category: 'resort', area: 'Lasithi' },
  { id: 'sissi', name: 'Sissi', category: 'resort', area: 'Lasithi' },
  
  // Villages
  { id: 'kissamos', name: 'Kissamos (Kastelli)', category: 'village', area: 'Chania' },
  { id: 'paleochora', name: 'Paleochora', category: 'village', area: 'Chania' },
  { id: 'sfakia', name: 'Sfakia (Hora Sfakion)', category: 'village', area: 'Chania' },
  { id: 'loutro', name: 'Loutro', category: 'village', area: 'Chania' },
  { id: 'spili', name: 'Spili', category: 'village', area: 'Rethymno' },
  { id: 'plakias', name: 'Plakias', category: 'village', area: 'Rethymno' },
  { id: 'agia-galini', name: 'Agia Galini', category: 'village', area: 'Rethymno' },
  { id: 'matala', name: 'Matala', category: 'village', area: 'Heraklion' },
  { id: 'lentas', name: 'Lentas', category: 'village', area: 'Heraklion' },
  { id: 'archanes', name: 'Archanes', category: 'village', area: 'Heraklion' },
  { id: 'zaros', name: 'Zaros', category: 'village', area: 'Heraklion' },
  { id: 'kritsa', name: 'Kritsa', category: 'village', area: 'Lasithi' },
  
  // Popular Beaches
  { id: 'balos', name: 'Balos Beach & Lagoon', category: 'beach', area: 'Chania' },
  { id: 'elafonisi', name: 'Elafonisi Beach', category: 'beach', area: 'Chania' },
  { id: 'falassarna', name: 'Falassarna Beach', category: 'beach', area: 'Chania' },
  { id: 'seitan-limania', name: 'Seitan Limania Beach', category: 'beach', area: 'Chania' },
  { id: 'marathi', name: 'Marathi Beach', category: 'beach', area: 'Chania' },
  { id: 'stavros', name: 'Stavros Beach', category: 'beach', area: 'Chania' },
  { id: 'preveli', name: 'Preveli Beach', category: 'beach', area: 'Rethymno' },
  { id: 'triopetra', name: 'Triopetra Beach', category: 'beach', area: 'Rethymno' },
  { id: 'vai', name: 'Vai Palm Beach', category: 'beach', area: 'Lasithi' },
  { id: 'voulisma', name: 'Voulisma Beach', category: 'beach', area: 'Lasithi' },
  
  // Landmarks & Attractions
  { id: 'knossos', name: 'Knossos Palace', category: 'landmark', area: 'Heraklion' },
  { id: 'samaria', name: 'Samaria Gorge', category: 'landmark', area: 'Chania' },
  { id: 'spinalonga', name: 'Spinalonga Island', category: 'landmark', area: 'Lasithi' },
  { id: 'arkadi', name: 'Arkadi Monastery', category: 'landmark', area: 'Rethymno' },
  { id: 'phaistos', name: 'Phaistos Palace', category: 'landmark', area: 'Heraklion' },
  { id: 'dikteon-cave', name: 'Dikteon Cave (Zeus Cave)', category: 'landmark', area: 'Lasithi' },
  { id: 'lasithi-plateau', name: 'Lasithi Plateau', category: 'landmark', area: 'Lasithi' },
  { id: 'botanical-park', name: 'Botanical Park & Gardens', category: 'landmark', area: 'Chania' },
  { id: 'venizelos-graves', name: 'Venizelos Graves (Akrotiri)', category: 'landmark', area: 'Chania' },
  { id: 'lake-kournas', name: 'Lake Kournas', category: 'landmark', area: 'Chania' },
  { id: 'cretaquarium', name: 'CRETAquarium', category: 'landmark', area: 'Heraklion' },
  { id: 'heraklion-museum', name: 'Archaeological Museum Heraklion', category: 'landmark', area: 'Heraklion' },
  
  // Popular Hotels - Chania Region
  { id: 'domes-noruz', name: 'Domes Noruz Chania', category: 'hotel', area: 'Chania' },
  { id: 'casa-delfino', name: 'Casa Delfino Hotel & Spa', category: 'hotel', area: 'Chania' },
  { id: 'ambassadors', name: 'Ambassadors Residence Boutique Hotel', category: 'hotel', area: 'Chania' },
  { id: 'alcanea', name: 'Alcanea Boutique Hotel', category: 'hotel', area: 'Chania' },
  { id: 'porto-veneziano', name: 'Porto Veneziano Hotel', category: 'hotel', area: 'Chania' },
  { id: 'samaria-hotel', name: 'Samaria Hotel', category: 'hotel', area: 'Chania' },
  { id: 'kydon-hotel', name: 'Kydon The Heart City Hotel', category: 'hotel', area: 'Chania' },
  { id: 'minoa-palace', name: 'Minoa Palace Resort', category: 'hotel', area: 'Platanias' },
  { id: 'louis-creta-princess', name: 'Louis Creta Princess', category: 'hotel', area: 'Platanias' },
  { id: 'cretan-dream', name: 'Cretan Dream Royal', category: 'hotel', area: 'Agia Marina' },
  { id: 'santa-marina', name: 'Santa Marina Beach Resort', category: 'hotel', area: 'Agia Marina' },
  { id: 'almyrida-beach', name: 'Almyrida Beach Hotel', category: 'hotel', area: 'Almyrida' },
  { id: 'mythos-palace', name: 'Mythos Palace Resort & Spa', category: 'hotel', area: 'Georgioupolis' },
  { id: 'anemos-luxury', name: 'Anemos Luxury Grand Resort', category: 'hotel', area: 'Georgioupolis' },
  { id: 'pilot-beach', name: 'Pilot Beach Resort', category: 'hotel', area: 'Georgioupolis' },
  
  // Popular Hotels - Rethymno Region
  { id: 'rimondi-boutique', name: 'Rimondi Boutique Hotel', category: 'hotel', area: 'Rethymno' },
  { id: 'avli-lounge', name: 'Avli Lounge Apartments', category: 'hotel', area: 'Rethymno' },
  { id: 'palazzo-rimondi', name: 'Palazzo Rimondi', category: 'hotel', area: 'Rethymno' },
  { id: 'grecotel-creta', name: 'Grecotel Creta Palace', category: 'hotel', area: 'Rethymno' },
  { id: 'rethymno-mare', name: 'Rethymno Mare Royal', category: 'hotel', area: 'Rethymno' },
  { id: 'caramel', name: 'Caramel Grecotel Boutique Resort', category: 'hotel', area: 'Rethymno' },
  { id: 'bali-beach', name: 'Bali Beach Hotel & Village', category: 'hotel', area: 'Bali' },
  
  // Popular Hotels - Heraklion Region
  { id: 'gdm-megaron', name: 'GDM Megaron Luxury Hotel', category: 'hotel', area: 'Heraklion' },
  { id: 'galaxy-hotel', name: 'Galaxy Hotel Heraklion', category: 'hotel', area: 'Heraklion' },
  { id: 'olive-green', name: 'Olive Green Hotel', category: 'hotel', area: 'Heraklion' },
  { id: 'lato-boutique', name: 'Lato Boutique Hotel', category: 'hotel', area: 'Heraklion' },
  { id: 'aquila-atlantis', name: 'Aquila Atlantis Hotel', category: 'hotel', area: 'Heraklion' },
  { id: 'creta-maris', name: 'Creta Maris Resort', category: 'hotel', area: 'Hersonissos' },
  { id: 'aldemar-knossos', name: 'Aldemar Knossos Royal', category: 'hotel', area: 'Hersonissos' },
  { id: 'stella-island', name: 'Stella Island Luxury Resort', category: 'hotel', area: 'Hersonissos' },
  { id: 'nana-princess', name: 'Nana Princess Suites Villas & Spa', category: 'hotel', area: 'Hersonissos' },
  { id: 'abaton-island', name: 'Abaton Island Resort & Spa', category: 'hotel', area: 'Hersonissos' },
  { id: 'blue-palace', name: 'Blue Palace Elounda', category: 'hotel', area: 'Elounda' },
  { id: 'daios-cove', name: 'Daios Cove Luxury Resort', category: 'hotel', area: 'Agios Nikolaos' },
  { id: 'out-of-blue', name: 'Out of the Blue Resort', category: 'hotel', area: 'Agia Pelagia' },
  
  // Popular Hotels - Lasithi Region
  { id: 'elounda-bay', name: 'Elounda Bay Palace', category: 'hotel', area: 'Elounda' },
  { id: 'elounda-beach', name: 'Elounda Beach Hotel', category: 'hotel', area: 'Elounda' },
  { id: 'elounda-mare', name: 'Elounda Mare Relais & Châteaux', category: 'hotel', area: 'Elounda' },
  { id: 'domes-elounda', name: 'Domes of Elounda', category: 'hotel', area: 'Elounda' },
  { id: 'minos-beach', name: 'Minos Beach Art Hotel', category: 'hotel', area: 'Agios Nikolaos' },
  { id: 'st-nicolas-bay', name: 'St. Nicolas Bay Resort', category: 'hotel', area: 'Agios Nikolaos' },
  { id: 'istron-bay', name: 'Istron Bay Hotel', category: 'hotel', area: 'Agios Nikolaos' },
  { id: 'wyndham-grand', name: 'Wyndham Grand Crete Mirabello Bay', category: 'hotel', area: 'Agios Nikolaos' },
];

export const CATEGORY_LABELS: Record<Location['category'], string> = {
  airport: 'Airport',
  city: 'City',
  resort: 'Resort Area',
  beach: 'Beach',
  port: 'Port',
  hotel: 'Hotel',
  landmark: 'Attraction',
  village: 'Village',
};

// Recent routes
export interface RecentRoute {
  pickup: string;
  dropoff: string;
  timestamp: number;
}

const RECENT_ROUTES_KEY = 'liv_recent_routes';
const MAX_RECENT_ROUTES = 5;

export const useRecentRoutes = () => {
  const [recentRoutes, setRecentRoutes] = useState<RecentRoute[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_ROUTES_KEY);
    if (stored) {
      try {
        setRecentRoutes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent routes');
      }
    }
  }, []);

  const addRecentRoute = useCallback((pickup: string, dropoff: string) => {
    if (!pickup || !dropoff) return;
    
    const newRoute: RecentRoute = { pickup, dropoff, timestamp: Date.now() };
    
    setRecentRoutes(prev => {
      // Remove duplicate routes
      const filtered = prev.filter(
        r => !(r.pickup === pickup && r.dropoff === dropoff)
      );
      const updated = [newRoute, ...filtered].slice(0, MAX_RECENT_ROUTES);
      localStorage.setItem(RECENT_ROUTES_KEY, JSON.stringify(updated));
      trackEvent('recent_route_saved' as TrackingEvent, { pickup, dropoff });
      return updated;
    });
  }, []);

  const clearRecentRoutes = useCallback(() => {
    localStorage.removeItem(RECENT_ROUTES_KEY);
    setRecentRoutes([]);
  }, []);

  return { recentRoutes, addRecentRoute, clearRecentRoutes };
};

// Saved quotes
export interface SavedQuote {
  id: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  passengers: string;
  vehicleType: string;
  luggage: string;
  childSeat: number;
  extraStop: boolean;
  meetGreet: boolean;
  savedAt: number;
}

const SAVED_QUOTES_KEY = 'liv_saved_quotes';
const MAX_SAVED_QUOTES = 3;

export const useSavedQuotes = () => {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(SAVED_QUOTES_KEY);
    if (stored) {
      try {
        setSavedQuotes(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse saved quotes');
      }
    }
  }, []);

  const saveQuote = useCallback((quote: Omit<SavedQuote, 'id' | 'savedAt'>) => {
    const newQuote: SavedQuote = {
      ...quote,
      id: `quote_${Date.now()}`,
      savedAt: Date.now(),
    };
    
    setSavedQuotes(prev => {
      const updated = [newQuote, ...prev].slice(0, MAX_SAVED_QUOTES);
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(updated));
      trackEvent('quote_save_click' as TrackingEvent);
      return updated;
    });
    
    return newQuote.id;
  }, []);

  const removeQuote = useCallback((id: string) => {
    setSavedQuotes(prev => {
      const updated = prev.filter(q => q.id !== id);
      localStorage.setItem(SAVED_QUOTES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSavedQuotes = useCallback(() => {
    localStorage.removeItem(SAVED_QUOTES_KEY);
    setSavedQuotes([]);
  }, []);

  return { savedQuotes, saveQuote, removeQuote, clearSavedQuotes };
};

// Smart defaults (remember preferences)
export interface UserPreferences {
  passengers: string;
  vehicleType: string;
  luggage: string;
  childSeat: number;
  extraStop: boolean;
  meetGreet: boolean;
}

const USER_PREFS_KEY = 'liv_user_preferences';

export const useSmartDefaults = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [defaultsApplied, setDefaultsApplied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(USER_PREFS_KEY);
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        setPreferences(prefs);
      } catch (e) {
        console.error('Failed to parse user preferences');
      }
    }
  }, []);

  const savePreferences = useCallback((prefs: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...prefs } as UserPreferences;
      localStorage.setItem(USER_PREFS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const applyDefaults = useCallback(() => {
    if (preferences && !defaultsApplied) {
      setDefaultsApplied(true);
      trackEvent('defaults_applied' as TrackingEvent);
      return preferences;
    }
    return null;
  }, [preferences, defaultsApplied]);

  const clearPreferences = useCallback(() => {
    localStorage.removeItem(USER_PREFS_KEY);
    setPreferences(null);
    setDefaultsApplied(false);
  }, []);

  return { preferences, savePreferences, applyDefaults, clearPreferences };
};

// Location autocomplete hook
export const useLocationAutocomplete = (query: string) => {
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const justSelectedRef = useRef(false);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // If a selection was just made, don't reopen the dropdown
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    // If query exactly matches a known location name, don't show suggestions
    const exactMatch = LOCATIONS.some(loc => loc.name.toLowerCase() === lowerQuery);
    if (exactMatch) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Priority scoring for better results
    const scoredMatches = LOCATIONS
      .map(loc => {
        let score = 0;
        const nameLower = loc.name.toLowerCase();
        const areaLower = (loc.area || '').toLowerCase();
        
        if (nameLower.startsWith(lowerQuery)) {
          score += 100;
        } else if (nameLower.includes(lowerQuery)) {
          score += 50;
        } else if (areaLower.includes(lowerQuery)) {
          score += 30;
        } else if (loc.category.toLowerCase().includes(lowerQuery)) {
          score += 20;
        } else if (loc.shortCode && loc.shortCode.toLowerCase().includes(lowerQuery)) {
          score += 80;
        }
        
        if (score > 0) {
          if (loc.category === 'airport') score += 15;
          else if (loc.category === 'port') score += 12;
          else if (loc.category === 'hotel') score += 10;
          else if (loc.category === 'city') score += 8;
        }
        
        return { location: loc, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.location);

    setSuggestions(scoredMatches);
    setShowSuggestions(scoredMatches.length > 0);
    
    if (scoredMatches.length > 0) {
      trackEvent('autocomplete_suggestion_view' as TrackingEvent);
    }
  }, [query]);

  const selectSuggestion = useCallback((location: Location) => {
    trackEvent('autocomplete_select' as TrackingEvent, { 
      pickup: location.name,
      category: location.category 
    });
    justSelectedRef.current = true;
    setShowSuggestions(false);
    return location;
  }, []);

  const hideSuggestions = useCallback(() => {
    setShowSuggestions(false);
  }, []);

  return { suggestions, showSuggestions, selectSuggestion, hideSuggestions };
};
