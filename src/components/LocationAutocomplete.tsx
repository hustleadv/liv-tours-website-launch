import { useState, useRef, useEffect, lazy, Suspense, forwardRef } from "react";
import { MapPin, Navigation, Plane, Building2, Palmtree, Waves, Anchor, Loader2, Map, Hotel, Landmark, Mountain } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  useLocationAutocomplete, 
  Location, 
  CATEGORY_LABELS,
  LOCATIONS
} from "@/hooks/useSmartBooking";

// Seasonal and time-based popular destinations
const getPopularDestinations = (): Location[] => {
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const hour = now.getHours();
  
  // Summer months (May-September): beaches and resorts
  const summerDestinations = [
    'elafonisi', 'balos', 'vai-beach', 'seitan-limania',
    'blue-palace', 'daios-cove', 'heraklion-airport', 'chania-airport'
  ];
  
  // Winter/Spring months (October-April): cultural sites and cities
  const winterDestinations = [
    'knossos', 'chania-old-town', 'rethymno', 'heraklion-airport',
    'chania-airport', 'arkadi-monastery', 'blue-palace', 'agios-nikolaos'
  ];
  
  // Morning (5-11): airports and hotels
  const morningDestinations = [
    'heraklion-airport', 'chania-airport', 'blue-palace', 'daios-cove',
    'minos-palace', 'creta-maris', 'rethymno', 'chania-old-town'
  ];
  
  // Evening (17-23): cities and restaurants areas
  const eveningDestinations = [
    'chania-old-town', 'rethymno', 'heraklion-city', 'agios-nikolaos',
    'hersonissos', 'malia', 'heraklion-airport', 'chania-airport'
  ];
  
  let destinationIds: string[];
  
  // Time-based priority
  if (hour >= 5 && hour < 11) {
    destinationIds = morningDestinations;
  } else if (hour >= 17 && hour < 23) {
    destinationIds = eveningDestinations;
  } else {
    // Seasonal priority for midday and night
    const isSummer = month >= 4 && month <= 8; // May-September
    destinationIds = isSummer ? summerDestinations : winterDestinations;
  }
  
  return destinationIds
    .map(id => LOCATIONS.find(loc => loc.id === id))
    .filter(Boolean)
    .slice(0, 8) as Location[];
};

// Get current popular destinations
const POPULAR_DESTINATIONS = getPopularDestinations();

// Recent locations storage key
const RECENT_LOCATIONS_KEY = 'liv-recent-locations';
const MAX_RECENT_LOCATIONS = 3;

// IP geolocation cache key
const IP_LOCATION_CACHE_KEY = 'liv-ip-location-cache';
const IP_CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

interface IPLocationCache {
  latitude: number;
  longitude: number;
  city?: string;
  timestamp: number;
}

// Get cached IP location
const getCachedIPLocation = (): IPLocationCache | null => {
  try {
    const cached = sessionStorage.getItem(IP_LOCATION_CACHE_KEY);
    if (!cached) return null;
    
    const data = JSON.parse(cached) as IPLocationCache;
    
    // Check if cache is still valid
    if (Date.now() - data.timestamp > IP_CACHE_DURATION_MS) {
      sessionStorage.removeItem(IP_LOCATION_CACHE_KEY);
      return null;
    }
    
    return data;
  } catch {
    return null;
  }
};

// Save IP location to cache
const saveIPLocationToCache = (latitude: number, longitude: number, city?: string) => {
  try {
    const data: IPLocationCache = {
      latitude,
      longitude,
      city,
      timestamp: Date.now()
    };
    sessionStorage.setItem(IP_LOCATION_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail
  }
};

// Get recent locations from localStorage
const getRecentLocations = (): Location[] => {
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
    if (!stored) return [];
    const ids = JSON.parse(stored) as string[];
    return ids
      .map(id => LOCATIONS.find(loc => loc.id === id))
      .filter(Boolean) as Location[];
  } catch {
    return [];
  }
};

// Save a location to recent locations
const saveRecentLocation = (locationId: string) => {
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
    let ids: string[] = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists (to move to front)
    ids = ids.filter(id => id !== locationId);
    
    // Add to front
    ids.unshift(locationId);
    
    // Keep only max items
    ids = ids.slice(0, MAX_RECENT_LOCATIONS);
    
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(ids));
  } catch {
    // Silently fail
  }
};

// Lazy load the map picker to avoid loading Leaflet on initial page load
const MapPickerModal = lazy(() => import("@/components/MapPickerModal"));

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (location: Location) => void;
  onCategorySelect?: (category: Location['category']) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  error?: boolean;
  className?: string;
  id?: string;
  onFocus?: () => void;
  "data-tracking-id"?: string;
  hidePopularDestinations?: boolean;
}

const getCategoryIcon = (category: Location['category']) => {
  switch (category) {
    case 'airport': return <Plane className="w-3.5 h-3.5" />;
    case 'city': return <Building2 className="w-3.5 h-3.5" />;
    case 'resort': return <Palmtree className="w-3.5 h-3.5" />;
    case 'beach': return <Waves className="w-3.5 h-3.5" />;
    case 'port': return <Anchor className="w-3.5 h-3.5" />;
    case 'hotel': return <Hotel className="w-3.5 h-3.5" />;
    case 'landmark': return <Landmark className="w-3.5 h-3.5" />;
    case 'village': return <Mountain className="w-3.5 h-3.5" />;
    default: return <MapPin className="w-3.5 h-3.5" />;
  }
};

const getCategoryColor = (category: Location['category']) => {
  switch (category) {
    case 'airport': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300';
    case 'city': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300';
    case 'resort': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300';
    case 'beach': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300';
    case 'port': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300';
    case 'hotel': return 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300';
    case 'landmark': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300';
    case 'village': return 'bg-stone-100 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

const LocationAutocomplete = forwardRef<HTMLInputElement, LocationAutocompleteProps>(({
  value,
  onChange,
  onSelect,
  onCategorySelect,
  placeholder = "Enter location...",
  icon,
  error,
  className,
  id,
  onFocus,
  "data-tracking-id": trackingId,
  hidePopularDestinations = false,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Location['category'] | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [recentLocations, setRecentLocations] = useState<Location[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const internalInputRef = useRef<HTMLInputElement>(null);
  const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalInputRef;
  const justSelectedRef = useRef(false);
  const { suggestions, showSuggestions, selectSuggestion, hideSuggestions } = useLocationAutocomplete(value);

  // Load recent locations on mount
  useEffect(() => {
    setRecentLocations(getRecentLocations());
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        hideSuggestions();
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [hideSuggestions]);

  const handleSelect = (location: Location) => {
    justSelectedRef.current = true;
    selectSuggestion(location);
    onChange(location.name);
    setSelectedCategory(location.category);
    onCategorySelect?.(location.category);
    onSelect?.(location);
    
    // Close dropdown immediately after selection
    hideSuggestions();
    setIsFocused(false);
    
    // Blur the input to close keyboard on mobile and ensure dropdown stays closed
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Reset the flag after a short delay
    setTimeout(() => { justSelectedRef.current = false; }, 300);
    
    // Save to recent locations
    saveRecentLocation(location.id);
    setRecentLocations(getRecentLocations());
  };

  const handleUseCurrentLocation = async () => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser", {
        description: "Try using 'Pick on map' instead"
      });
      setIsMapPickerOpen(true);
      return;
    }

    // Check if we're on HTTPS (required for geolocation on most browsers)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecure) {
      toast.error("Location requires a secure connection", {
        description: "Please use 'Pick on map' instead"
      });
      setIsMapPickerOpen(true);
      return;
    }

    // Check permissions API if available (helps on Android Chrome)
    if (navigator.permissions) {
      try {
        const permResult = await navigator.permissions.query({ name: 'geolocation' });
        if (permResult.state === 'denied') {
          toast.error("Location access is blocked", {
            description: "Enable location in your device Settings > Privacy > Location Services, then reload the page.",
          });
          setIsMapPickerOpen(true);
          return;
        }
      } catch {
        // permissions.query not supported for geolocation on some browsers (Safari) - continue
      }
    }

    setIsGettingLocation(true);

    // Helper to reverse geocode and set location
    const reverseGeocodeAndSet = async (latitude: number, longitude: number, accuracy: number) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=19&addressdetails=1&namedetails=1&extratags=1&accept-language=en`,
          {
            headers: {
              'Accept-Language': 'en',
              'User-Agent': 'LivToursApp/1.0'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          const address = data.address;
          let formattedAddress = '';
          let hasStreetAddress = false;
          
          if (address) {
            const streetParts: string[] = [];
            const locationParts: string[] = [];
            
            if (address.house_number && address.road) {
              streetParts.push(`${address.road} ${address.house_number}`);
              hasStreetAddress = true;
            } else if (address.road) {
              streetParts.push(address.road);
              hasStreetAddress = true;
            } else if (address.pedestrian) {
              streetParts.push(address.pedestrian);
              hasStreetAddress = true;
            } else if (address.footway) {
              streetParts.push(address.footway);
              hasStreetAddress = true;
            }
            
            if (data.name && data.name !== address.road) {
              streetParts.unshift(data.name);
              hasStreetAddress = true;
            } else if (address.building) {
              streetParts.unshift(address.building);
              hasStreetAddress = true;
            } else if (address.amenity) {
              streetParts.unshift(address.amenity);
              hasStreetAddress = true;
            } else if (address.tourism) {
              streetParts.unshift(address.tourism);
              hasStreetAddress = true;
            } else if (address.shop) {
              streetParts.unshift(address.shop);
              hasStreetAddress = true;
            } else if (address.leisure) {
              streetParts.unshift(address.leisure);
              hasStreetAddress = true;
            } else if (address.historic) {
              streetParts.unshift(address.historic);
              hasStreetAddress = true;
            }
            
            if (address.suburb) locationParts.push(address.suburb);
            else if (address.neighbourhood) locationParts.push(address.neighbourhood);
            else if (address.quarter) locationParts.push(address.quarter);
            
            const city = address.city || address.town || address.village || address.municipality;
            if (city) locationParts.push(city);
            
            if (streetParts.length > 0) {
              formattedAddress = streetParts.join(', ');
              if (locationParts.length > 0) {
                formattedAddress += `, ${locationParts.join(', ')}`;
              }
            } else if (locationParts.length > 0) {
              formattedAddress = locationParts.join(', ');
            } else {
              formattedAddress = data.display_name?.split(',').slice(0, 4).join(',').trim() || '';
            }
          }
          
          if (!hasStreetAddress || !formattedAddress) {
            setIsGettingLocation(false);
            toast.info("Please select your exact location on the map", {
              description: "GPS found your area but needs more precision"
            });
            setIsMapPickerOpen(true);
            return;
          }
          
          onChange(formattedAddress.trim());
          
          if (accuracy <= 20) {
            toast.success(`Location found: ${formattedAddress.split(',')[0]}`, {
              description: `Accuracy: ±${Math.round(accuracy)}m`
            });
          } else if (accuracy <= 100) {
            toast.success(`Location found`, {
              description: formattedAddress.split(',').slice(0, 2).join(', ')
            });
          } else {
            toast.info(`Approximate location found`, {
              description: "Tap 'Pick on map' for more precision",
              action: {
                label: "Pick on map",
                onClick: () => setIsMapPickerOpen(true)
              }
            });
          }
        } else {
          setIsGettingLocation(false);
          toast.info("Please select your location on the map");
          setIsMapPickerOpen(true);
          return;
        }
      } catch (error) {
        console.error('Reverse geocoding error:', error);
        setIsGettingLocation(false);
        toast.info("Please select your location on the map");
        setIsMapPickerOpen(true);
        return;
      }
      
      setSelectedCategory(null);
      hideSuggestions();
      setIsFocused(false);
      setIsGettingLocation(false);
    };

    // Handle geolocation error with IP fallback
    const handleGeoError = async (error: GeolocationPositionError) => {
      console.error('Geolocation error:', error);
      
      // Try IP-based geolocation as fallback
      try {
        const cachedIP = getCachedIPLocation();
        
        if (cachedIP) {
          console.log('Using cached IP location');
          toast.info("Using cached location", {
            description: cachedIP.city || "Approximate location"
          });
          setIsGettingLocation(false);
          setIsMapPickerOpen(true);
          return;
        }
        
        toast.info("GPS unavailable, trying IP location...");
        
        const ipResponse = await fetch('https://ipapi.co/json/');
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          
          if (ipData.latitude && ipData.longitude && ipData.country_code === 'GR') {
            const city = ipData.city || ipData.region;
            saveIPLocationToCache(ipData.latitude, ipData.longitude, city);
            
            const geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${ipData.latitude}&lon=${ipData.longitude}&zoom=16&addressdetails=1&accept-language=en`,
              {
                headers: {
                  'Accept-Language': 'en',
                  'User-Agent': 'LivToursApp/1.0'
                }
              }
            );
            
            if (geoResponse.ok) {
              const geoData = await geoResponse.json();
              const address = geoData.address;
              
              const parts: string[] = [];
              if (address?.suburb) parts.push(address.suburb);
              else if (address?.neighbourhood) parts.push(address.neighbourhood);
              
              const city2 = address?.city || address?.town || address?.village || address?.municipality;
              if (city2) parts.push(city2);
              
              if (parts.length > 0) {
                setIsGettingLocation(false);
                
                toast.info("Approximate location found", {
                  description: `${parts.join(', ')} - Use 'Pick on map' for exact address`,
                  action: {
                    label: "Pick on map",
                    onClick: () => setIsMapPickerOpen(true)
                  }
                });
                
                setIsMapPickerOpen(true);
                return;
              }
            }
          }
        }
      } catch (ipError) {
        console.error('IP geolocation fallback failed:', ipError);
      }
      
      setIsGettingLocation(false);
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          toast.error("Location access denied", {
            description: "Enable location in browser settings, or use 'Pick on map'",
            action: {
              label: "Pick on map",
              onClick: () => setIsMapPickerOpen(true)
            }
          });
          break;
        case error.POSITION_UNAVAILABLE:
          toast.error("Location unavailable", {
            description: "Your device couldn't determine your location. Try 'Pick on map'",
            action: {
              label: "Pick on map",
              onClick: () => setIsMapPickerOpen(true)
            }
          });
          break;
        case error.TIMEOUT:
          toast.error("Location request timed out", {
            description: "Please try again or use 'Pick on map'",
            action: {
              label: "Pick on map",
              onClick: () => setIsMapPickerOpen(true)
            }
          });
          break;
        default:
          toast.error("Could not get location", {
            description: "Please use 'Pick on map' to select your location",
            action: {
              label: "Pick on map",
              onClick: () => setIsMapPickerOpen(true)
            }
          });
      }
      
      setIsMapPickerOpen(true);
    };

    // Two-step approach for better iOS/Android compatibility:
    // Step 1: Try high accuracy (GPS) with a shorter timeout
    // Step 2: If that fails/times out, try low accuracy (network/cell) which works faster
    const tryHighAccuracy = () => {
      const highAccuracyTimeout = setTimeout(() => {
        // High accuracy is taking too long - try low accuracy as fallback
        console.log('High accuracy timeout, falling back to low accuracy');
        navigator.geolocation.getCurrentPosition(
          (position) => {
            reverseGeocodeAndSet(
              position.coords.latitude,
              position.coords.longitude,
              position.coords.accuracy
            );
          },
          handleGeoError,
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      }, 8000); // 8 seconds for high accuracy before fallback

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(highAccuracyTimeout);
          reverseGeocodeAndSet(
            position.coords.latitude,
            position.coords.longitude,
            position.coords.accuracy
          );
        },
        (error) => {
          clearTimeout(highAccuracyTimeout);
          // If permission denied, don't retry with low accuracy
          if (error.code === error.PERMISSION_DENIED) {
            handleGeoError(error);
            return;
          }
          // Try low accuracy fallback
          console.log('High accuracy failed, trying low accuracy');
          navigator.geolocation.getCurrentPosition(
            (position) => {
              reverseGeocodeAndSet(
                position.coords.latitude,
                position.coords.longitude,
                position.coords.accuracy
              );
            },
            handleGeoError,
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 60000
            }
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    };

    tryHighAccuracy();
  };

  // Handle map picker selection
  const handleMapSelect = (address: string, lat: number, lng: number) => {
    onChange(address);
    setSelectedCategory(null);
    hideSuggestions();
    setIsFocused(false);
    toast.success("Location selected from map");
  };

  // Open map picker
  const handleOpenMapPicker = () => {
    setIsMapPickerOpen(true);
    hideSuggestions();
    setIsFocused(false);
  };

  return (
    <>
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedCategory(null);
          }}
          onFocus={() => {
            if (!justSelectedRef.current) {
              setIsFocused(true);
            }
            onFocus?.();
          }}
          placeholder={placeholder}
          className={cn(
            icon && "pl-10",
            selectedCategory && "pr-20",
            error && "border-destructive",
            className
          )}
          data-tracking-id={trackingId}
        />
        {selectedCategory && (
          <span className={cn(
            "absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1",
            getCategoryColor(selectedCategory)
          )}>
            {getCategoryIcon(selectedCategory)}
            {CATEGORY_LABELS[selectedCategory]}
          </span>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isFocused && (showSuggestions || value.length < 2) && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
          {/* Use current location button */}
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isGettingLocation}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors border-b border-border disabled:opacity-60 disabled:cursor-wait"
          >
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
              {isGettingLocation ? (
                <Loader2 className="w-4 h-4 text-accent animate-spin" />
              ) : (
                <Navigation className="w-4 h-4 text-accent" />
              )}
            </div>
            <span className="font-medium text-foreground">
              {isGettingLocation ? "Getting location..." : "Use current location"}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">GPS</span>
          </button>

          {/* Pick on map button */}
          <button
            type="button"
            onClick={handleOpenMapPicker}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors border-b border-border"
          >
            <div className="w-8 h-8 rounded-full bg-olive/20 flex items-center justify-center">
              <Map className="w-4 h-4 text-olive" />
            </div>
            <span className="font-medium text-foreground">Pick on map</span>
            <span className="text-xs text-muted-foreground ml-auto">Precise</span>
          </button>

          {/* Suggestions list */}
          {suggestions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {suggestions.map((location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() => handleSelect(location)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-muted/50 transition-colors"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    getCategoryColor(location.category)
                  )}>
                    {getCategoryIcon(location.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{location.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {CATEGORY_LABELS[location.category]}
                      {location.area && ` • ${location.area}`}
                    </p>
                  </div>
                  {location.shortCode && (
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                      {location.shortCode}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : value.length >= 2 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              <p>No matching locations found</p>
              <p className="text-xs mt-1">Type your full address or hotel name</p>
            </div>
          ) : (
            /* Recent locations and Popular destinations when no search query */
            <div className="py-2">
              {/* Recent Locations Section */}
              {recentLocations.length > 0 && (
                <>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Navigation className="w-3 h-3" />
                    Recent Locations
                  </p>
                  <div className="mb-2">
                    {recentLocations.map((location) => (
                      <button
                        key={`recent-${location.id}`}
                        type="button"
                        onClick={() => handleSelect(location)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-primary/5 transition-colors border-l-2 border-primary/30"
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                          getCategoryColor(location.category)
                        )}>
                          {getCategoryIcon(location.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{location.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[location.category]}
                            {location.area && ` • ${location.area}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-border mx-4 my-2" />
                </>
              )}
              
              {/* Popular Destinations Section - conditionally hidden */}
              {!hidePopularDestinations && (
                <>
                  <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Popular Destinations
                  </p>
                  <div className="max-h-64 overflow-y-auto">
                    {POPULAR_DESTINATIONS.map((location) => (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => handleSelect(location)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-muted/50 transition-colors"
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                          getCategoryColor(location.category)
                        )}>
                          {getCategoryIcon(location.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">{location.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {CATEGORY_LABELS[location.category]}
                            {location.area && ` • ${location.area}`}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="px-4 py-2 text-xs text-muted-foreground border-t border-border mt-1">
                {hidePopularDestinations ? 'Type to search your hotel or address...' : 'Or type to search hotels, beaches, villages...'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Map Picker Modal */}
    {isMapPickerOpen && (
      <Suspense fallback={null}>
        <MapPickerModal
          isOpen={isMapPickerOpen}
          onClose={() => setIsMapPickerOpen(false)}
          onSelectLocation={handleMapSelect}
        />
      </Suspense>
    )}
    </>
  );
});

LocationAutocomplete.displayName = "LocationAutocomplete";

export default LocationAutocomplete;
